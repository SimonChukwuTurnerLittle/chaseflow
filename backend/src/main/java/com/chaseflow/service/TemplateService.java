package com.chaseflow.service;

import com.chaseflow.domain.Template;
import com.chaseflow.domain.enums.ContentFormat;
import com.chaseflow.domain.enums.TemplateType;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.dto.request.TemplateAssignRequest;
import com.chaseflow.dto.request.TemplateRequest;
import com.chaseflow.dto.response.TemplateResponse;
import com.chaseflow.exception.AccessDeniedException;
import com.chaseflow.exception.NotFoundException;
import com.chaseflow.exception.ValidationException;
import com.chaseflow.repository.ServiceRepository;
import com.chaseflow.repository.TemplateRepository;
import com.chaseflow.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final ServiceRepository serviceRepository;
    private final TenantContext tenantContext;

    @Transactional(readOnly = true)
    public List<TemplateResponse> listTemplates(UUID serviceId) {
        findServiceAndVerifyTenant(serviceId);
        return templateRepository.findByServiceId(serviceId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TemplateResponse> listUnassignedTemplates(UUID serviceId) {
        findServiceAndVerifyTenant(serviceId);
        return templateRepository.findByServiceIdAndStepNumberIsNull(serviceId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TemplateResponse createTemplate(UUID serviceId, TemplateRequest request) {
        assertAdmin();
        com.chaseflow.domain.Service service = findServiceAndVerifyTenant(serviceId);

        if (request.getTemplateType() == null || request.getTemplateType().isBlank()) {
            throw new ValidationException("Template type is required");
        }
        TemplateType type = TemplateType.valueOf(request.getTemplateType().toUpperCase());

        validateTemplateContent(type, request);

        Template template = Template.builder()
                .service(service)
                .stepNumber(null)
                .templateType(type)
                .templateTitle(request.getTemplateTitle())
                .templateDescription(request.getTemplateDescription())
                .subject(request.getSubject())
                .templateContent(request.getTemplateContent())
                .templateContentFormat(resolveFormat(type, request))
                .createdBy(tenantContext.currentUsername())
                .build();

        template = templateRepository.save(template);
        return toResponse(template);
    }

    @Transactional
    public TemplateResponse updateTemplateById(UUID serviceId, UUID templateId, TemplateRequest request) {
        assertAdmin();
        findServiceAndVerifyTenant(serviceId);
        Template template = findTemplateAndVerifyService(serviceId, templateId);

        validateTemplateContent(template.getTemplateType(), request);

        template.setTemplateTitle(request.getTemplateTitle());
        template.setTemplateDescription(request.getTemplateDescription());
        template.setSubject(request.getSubject());
        template.setTemplateContent(request.getTemplateContent());
        template.setTemplateContentFormat(resolveFormat(template.getTemplateType(), request));
        template.setUpdatedBy(tenantContext.currentUsername());

        template = templateRepository.save(template);
        return toResponse(template);
    }

    @Transactional
    public TemplateResponse duplicateTemplate(UUID serviceId, UUID templateId) {
        assertAdmin();
        com.chaseflow.domain.Service service = findServiceAndVerifyTenant(serviceId);
        Template source = findTemplateAndVerifyService(serviceId, templateId);

        Template copy = Template.builder()
                .service(service)
                .stepNumber(null)
                .templateType(source.getTemplateType())
                .templateTitle(source.getTemplateTitle() != null ? source.getTemplateTitle() + " (Copy)" : "Copy")
                .templateDescription(source.getTemplateDescription())
                .subject(source.getSubject())
                .templateContent(source.getTemplateContent())
                .templateContentFormat(source.getTemplateContentFormat())
                .createdBy(tenantContext.currentUsername())
                .build();

        copy = templateRepository.save(copy);
        return toResponse(copy);
    }

    @Transactional
    public TemplateResponse assignTemplate(UUID serviceId, UUID templateId, TemplateAssignRequest request) {
        assertAdmin();
        findServiceAndVerifyTenant(serviceId);
        Template template = findTemplateAndVerifyService(serviceId, templateId);

        if (request.getStepNumber() == null) {
            throw new ValidationException("Step number is required for assignment");
        }

        // Check no other template of same type is already assigned to this step
        Optional<Template> existing = templateRepository
                .findByServiceIdAndStepNumberAndTemplateType(serviceId, request.getStepNumber(), template.getTemplateType());
        if (existing.isPresent() && !existing.get().getId().equals(templateId)) {
            throw new ValidationException("A " + template.getTemplateType().name()
                    + " template is already assigned to step " + request.getStepNumber());
        }

        template.setStepNumber(request.getStepNumber());
        template.setUpdatedBy(tenantContext.currentUsername());
        template = templateRepository.save(template);
        return toResponse(template);
    }

    @Transactional
    public TemplateResponse unassignTemplate(UUID serviceId, UUID templateId) {
        assertAdmin();
        findServiceAndVerifyTenant(serviceId);
        Template template = findTemplateAndVerifyService(serviceId, templateId);

        template.setStepNumber(null);
        template.setUpdatedBy(tenantContext.currentUsername());
        template = templateRepository.save(template);
        return toResponse(template);
    }

    @Transactional
    public void deleteTemplate(UUID serviceId, UUID templateId) {
        assertAdmin();
        findServiceAndVerifyTenant(serviceId);
        Template template = findTemplateAndVerifyService(serviceId, templateId);

        template.setDeleted(true);
        templateRepository.save(template);
    }

    // Keep for backward compatibility
    @Transactional
    public TemplateResponse upsertTemplate(UUID serviceId, Integer stepNumber, String channel, TemplateRequest request) {
        assertAdmin();
        com.chaseflow.domain.Service service = findServiceAndVerifyTenant(serviceId);
        TemplateType type = TemplateType.valueOf(channel.toUpperCase());

        validateTemplateContent(type, request);

        Template template = templateRepository.findByServiceIdAndStepNumberAndTemplateType(serviceId, stepNumber, type)
                .orElse(Template.builder()
                        .service(service)
                        .stepNumber(stepNumber)
                        .templateType(type)
                        .createdBy(tenantContext.currentUsername())
                        .build());

        template.setTemplateTitle(request.getTemplateTitle());
        template.setTemplateDescription(request.getTemplateDescription());
        template.setSubject(request.getSubject());
        template.setTemplateContent(request.getTemplateContent());
        template.setTemplateContentFormat(resolveFormat(type, request));
        template.setUpdatedBy(tenantContext.currentUsername());

        template = templateRepository.save(template);
        return toResponse(template);
    }

    private void validateTemplateContent(TemplateType type, TemplateRequest request) {
        switch (type) {
            case EMAIL -> {
                // Subject validation only required if content is being set
            }
            case SMS -> {
                if (request.getTemplateContent() != null && request.getTemplateContent().length() > 160) {
                    throw new ValidationException("SMS template content must not exceed 160 characters");
                }
            }
            case WHATSAPP -> {
                if (request.getTemplateContent() != null && request.getTemplateContent().length() > 1024) {
                    throw new ValidationException("WhatsApp template content must not exceed 1024 characters");
                }
            }
        }
    }

    private ContentFormat resolveFormat(TemplateType type, TemplateRequest request) {
        return switch (type) {
            case EMAIL -> ContentFormat.HTML;
            case SMS, WHATSAPP -> ContentFormat.TEXT;
        };
    }

    private Template findTemplateAndVerifyService(UUID serviceId, UUID templateId) {
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new NotFoundException("Template not found with id: " + templateId));
        if (!template.getService().getId().equals(serviceId)) {
            throw new NotFoundException("Template not found with id: " + templateId);
        }
        return template;
    }

    private com.chaseflow.domain.Service findServiceAndVerifyTenant(UUID serviceId) {
        return serviceRepository.findByIdAndTenantId(serviceId, tenantContext.currentTenantId())
                .orElseThrow(() -> new NotFoundException("Service not found with id: " + serviceId));
    }

    private void assertAdmin() {
        if (tenantContext.currentUserRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can manage templates");
        }
    }

    TemplateResponse toResponse(Template t) {
        return TemplateResponse.builder()
                .id(t.getId())
                .serviceId(t.getService().getId())
                .stepNumber(t.getStepNumber())
                .templateTitle(t.getTemplateTitle())
                .templateDescription(t.getTemplateDescription())
                .templateType(t.getTemplateType().name())
                .subject(t.getSubject())
                .templateContent(t.getTemplateContent())
                .templateContentFormat(t.getTemplateContentFormat().name())
                .version(t.getVersion())
                .timeCreated(t.getTimeCreated())
                .timeUpdated(t.getTimeUpdated())
                .createdBy(t.getCreatedBy())
                .updatedBy(t.getUpdatedBy())
                .assigned(t.getStepNumber() != null)
                .build();
    }
}
