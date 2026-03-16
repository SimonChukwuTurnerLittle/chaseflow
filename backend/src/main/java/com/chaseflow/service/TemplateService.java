package com.chaseflow.service;

import com.chaseflow.domain.ChaseSequence;
import com.chaseflow.domain.Template;
import com.chaseflow.domain.enums.ContentFormat;
import com.chaseflow.domain.enums.TemplateType;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.dto.request.TemplateRequest;
import com.chaseflow.dto.response.TemplateResponse;
import com.chaseflow.exception.AccessDeniedException;
import com.chaseflow.exception.NotFoundException;
import com.chaseflow.exception.ValidationException;
import com.chaseflow.repository.ChaseSequenceRepository;
import com.chaseflow.repository.ServiceRepository;
import com.chaseflow.repository.TemplateRepository;
import com.chaseflow.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final ChaseSequenceRepository chaseSequenceRepository;
    private final ServiceRepository serviceRepository;
    private final TenantContext tenantContext;

    public List<TemplateResponse> listTemplates(UUID sequenceId) {
        ChaseSequence seq = findSequenceAndVerifyTenant(sequenceId);
        return templateRepository.findByChaseSequenceId(sequenceId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TemplateResponse upsertTemplate(UUID sequenceId, String channel, TemplateRequest request) {
        assertAdmin();
        ChaseSequence seq = findSequenceAndVerifyTenant(sequenceId);
        TemplateType type = TemplateType.valueOf(channel.toUpperCase());

        validateTemplateContent(type, request);

        Template template = templateRepository.findByChaseSequenceIdAndTemplateType(sequenceId, type)
                .orElse(Template.builder()
                        .service(seq.getService())
                        .chaseSequence(seq)
                        .templateType(type)
                        .createdBy(tenantContext.currentUsername())
                        .build());

        template.setTemplateTitle(request.getTemplateTitle());
        template.setTemplateDescription(request.getTemplateDescription());
        template.setSubject(request.getSubject());
        template.setTemplateContent(request.getTemplateContent());
        template.setTemplateContentFormat(resolveFormat(type, request));
        template.setAiPromptHint(request.getAiPromptHint());
        if (request.getUseAi() != null) template.setUseAi(request.getUseAi());
        template.setUpdatedBy(tenantContext.currentUsername());

        template = templateRepository.save(template);
        return toResponse(template);
    }

    private void validateTemplateContent(TemplateType type, TemplateRequest request) {
        switch (type) {
            case EMAIL -> {
                if (request.getSubject() == null || request.getSubject().isBlank()) {
                    throw new ValidationException("Email templates require a non-blank subject");
                }
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

    private ChaseSequence findSequenceAndVerifyTenant(UUID sequenceId) {
        ChaseSequence seq = chaseSequenceRepository.findById(sequenceId)
                .orElseThrow(() -> new NotFoundException("Chase sequence not found with id: " + sequenceId));
        com.chaseflow.domain.Service service = seq.getService();
        if (!service.getTenantId().equals(tenantContext.currentTenantId())) {
            throw new NotFoundException("Chase sequence not found with id: " + sequenceId);
        }
        return seq;
    }

    private void assertAdmin() {
        if (tenantContext.currentUserRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can manage templates");
        }
    }

    private TemplateResponse toResponse(Template t) {
        return TemplateResponse.builder()
                .id(t.getId())
                .serviceId(t.getService().getId())
                .chaseSequenceId(t.getChaseSequence().getId())
                .templateTitle(t.getTemplateTitle())
                .templateDescription(t.getTemplateDescription())
                .templateType(t.getTemplateType().name())
                .subject(t.getSubject())
                .templateContent(t.getTemplateContent())
                .templateContentFormat(t.getTemplateContentFormat().name())
                .aiPromptHint(t.getAiPromptHint())
                .useAi(t.getUseAi())
                .version(t.getVersion())
                .timeCreated(t.getTimeCreated())
                .timeUpdated(t.getTimeUpdated())
                .createdBy(t.getCreatedBy())
                .updatedBy(t.getUpdatedBy())
                .build();
    }
}
