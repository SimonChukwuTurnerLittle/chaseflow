package com.chaseflow.service;

import com.chaseflow.domain.ChaseSequence;
import com.chaseflow.domain.ServiceCategory;
import com.chaseflow.domain.enums.ServiceMode;
import com.chaseflow.domain.enums.Temperature;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.dto.request.ServiceCategoryRequest;
import com.chaseflow.dto.request.ServiceRequest;
import com.chaseflow.dto.response.ChaseSequenceResponse;
import com.chaseflow.dto.response.ServiceCategoryResponse;
import com.chaseflow.dto.response.ServiceResponse;
import com.chaseflow.dto.response.TemplateResponse;
import com.chaseflow.exception.AccessDeniedException;
import com.chaseflow.exception.NotFoundException;
import com.chaseflow.exception.ValidationException;
import com.chaseflow.repository.ServiceCategoryRepository;
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
public class ServiceManagementService {

    private final ServiceRepository serviceRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final TemplateRepository templateRepository;
    private final TenantContext tenantContext;

    // ── Service Categories ──

    public List<ServiceCategoryResponse> listCategories() {
        UUID tenantId = tenantContext.currentTenantId();
        return serviceCategoryRepository.findByTenantIdOrderBySortOrder(tenantId).stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    @Transactional
    public ServiceCategoryResponse createCategory(ServiceCategoryRequest request) {
        assertAdmin();
        UUID tenantId = tenantContext.currentTenantId();
        ServiceCategory category = ServiceCategory.builder()
                .tenantId(tenantId)
                .categoryName(request.getCategoryName())
                .colourHex(request.getColourHex())
                .iconKey(request.getIconKey())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();
        category = serviceCategoryRepository.save(category);
        return toCategoryResponse(category);
    }

    @Transactional
    public ServiceCategoryResponse updateCategory(UUID id, ServiceCategoryRequest request) {
        assertAdmin();
        ServiceCategory category = findCategoryByIdAndTenant(id);
        category.setCategoryName(request.getCategoryName());
        category.setColourHex(request.getColourHex());
        category.setIconKey(request.getIconKey());
        if (request.getSortOrder() != null) category.setSortOrder(request.getSortOrder());
        category = serviceCategoryRepository.save(category);
        return toCategoryResponse(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        assertAdmin();
        ServiceCategory category = findCategoryByIdAndTenant(id);
        category.setDeleted(true);
        serviceCategoryRepository.save(category);
    }

    // ── Services ──

    public List<ServiceResponse> listServices() {
        UUID tenantId = tenantContext.currentTenantId();
        return serviceRepository.findByTenantIdOrderBySortOrder(tenantId).stream()
                .map(this::toServiceResponse)
                .toList();
    }

    public ServiceResponse getService(UUID id) {
        return toServiceResponseWithSequences(findServiceByIdAndTenant(id));
    }

    @Transactional
    public ServiceResponse createService(ServiceRequest request) {
        assertAdmin();
        UUID tenantId = tenantContext.currentTenantId();

        ServiceMode mode = ServiceMode.valueOf(request.getServiceMode());
        if (mode == ServiceMode.PACKAGE && request.getPrice() == null) {
            throw new ValidationException("PACKAGE service must have a non-null price");
        }

        com.chaseflow.domain.Service service = com.chaseflow.domain.Service.builder()
                .tenantId(tenantId)
                .serviceName(request.getServiceName())
                .serviceDescription(request.getServiceDescription())
                .serviceMode(mode)
                .price(request.getPrice())
                .packageIncludes(request.getPackageIncludes())
                .defaultTemperature(request.getDefaultTemperature() != null
                        ? Temperature.valueOf(request.getDefaultTemperature()) : Temperature.MEDIUM)
                .recurrenceDays(request.getRecurrenceDays())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        if (request.getServiceCategoryId() != null) {
            ServiceCategory category = findCategoryByIdAndTenant(request.getServiceCategoryId());
            service.setServiceCategory(category);
        }

        service = serviceRepository.save(service);

        List<ChaseSequence> sequences = ChaseDefaults.seedSequences(service);
        service.getChaseSequences().addAll(sequences);
        service = serviceRepository.save(service);

        return toServiceResponseWithSequences(service);
    }

    @Transactional
    public ServiceResponse updateService(UUID id, ServiceRequest request) {
        assertAdmin();
        com.chaseflow.domain.Service service = findServiceByIdAndTenant(id);

        ServiceMode mode = ServiceMode.valueOf(request.getServiceMode());
        if (mode == ServiceMode.PACKAGE && request.getPrice() == null) {
            throw new ValidationException("PACKAGE service must have a non-null price");
        }

        service.setServiceName(request.getServiceName());
        service.setServiceDescription(request.getServiceDescription());
        service.setServiceMode(mode);
        service.setPrice(request.getPrice());
        service.setPackageIncludes(request.getPackageIncludes());
        if (request.getDefaultTemperature() != null) {
            service.setDefaultTemperature(Temperature.valueOf(request.getDefaultTemperature()));
        }
        service.setRecurrenceDays(request.getRecurrenceDays());
        if (request.getSortOrder() != null) service.setSortOrder(request.getSortOrder());

        if (request.getServiceCategoryId() != null) {
            ServiceCategory category = findCategoryByIdAndTenant(request.getServiceCategoryId());
            service.setServiceCategory(category);
        }

        service = serviceRepository.save(service);
        return toServiceResponseWithSequences(service);
    }

    @Transactional
    public void deleteService(UUID id) {
        assertAdmin();
        com.chaseflow.domain.Service service = findServiceByIdAndTenant(id);
        service.setDeleted(true);
        serviceRepository.save(service);
    }

    // ── Helpers ──

    private void assertAdmin() {
        if (tenantContext.currentUserRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can perform this action");
        }
    }

    private ServiceCategory findCategoryByIdAndTenant(UUID id) {
        UUID tenantId = tenantContext.currentTenantId();
        if (tenantId == null) throw new AccessDeniedException("Not authenticated");
        ServiceCategory cat = serviceCategoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service category not found with id: " + id));
        if (!cat.getTenantId().equals(tenantId)) {
            throw new NotFoundException("Service category not found with id: " + id);
        }
        return cat;
    }

    private com.chaseflow.domain.Service findServiceByIdAndTenant(UUID id) {
        return serviceRepository.findByIdAndTenantId(id, tenantContext.currentTenantId())
                .orElseThrow(() -> new NotFoundException("Service not found with id: " + id));
    }

    private ServiceCategoryResponse toCategoryResponse(ServiceCategory cat) {
        return ServiceCategoryResponse.builder()
                .id(cat.getId())
                .categoryName(cat.getCategoryName())
                .colourHex(cat.getColourHex())
                .iconKey(cat.getIconKey())
                .sortOrder(cat.getSortOrder())
                .timeCreated(cat.getTimeCreated())
                .timeUpdated(cat.getTimeUpdated())
                .build();
    }

    private ServiceResponse toServiceResponse(com.chaseflow.domain.Service s) {
        return ServiceResponse.builder()
                .id(s.getId())
                .serviceCategoryId(s.getServiceCategory() != null ? s.getServiceCategory().getId() : null)
                .categoryName(s.getServiceCategory() != null ? s.getServiceCategory().getCategoryName() : null)
                .serviceName(s.getServiceName())
                .serviceDescription(s.getServiceDescription())
                .serviceMode(s.getServiceMode().name())
                .price(s.getPrice())
                .packageIncludes(s.getPackageIncludes())
                .defaultTemperature(s.getDefaultTemperature().name())
                .recurrenceDays(s.getRecurrenceDays())
                .sortOrder(s.getSortOrder())
                .timeCreated(s.getTimeCreated())
                .timeUpdated(s.getTimeUpdated())
                .build();
    }

    ServiceResponse toServiceResponseWithSequences(com.chaseflow.domain.Service s) {
        ServiceResponse resp = toServiceResponse(s);
        resp.setSequences(s.getChaseSequences().stream()
                .map(seq -> ChaseSequenceResponse.builder()
                        .id(seq.getId())
                        .serviceId(s.getId())
                        .temperature(seq.getTemperature().name())
                        .stepNumber(seq.getStepNumber())
                        .delayDays(seq.getDelayDays())
                        .isFinalStep(seq.getIsFinalStep())
                        .stopOnReply(seq.getStopOnReply())
                        .templates(templateRepository.findByServiceIdAndStepNumber(s.getId(), seq.getStepNumber()).stream()
                                .map(t -> TemplateResponse.builder()
                                        .id(t.getId())
                                        .serviceId(s.getId())
                                        .stepNumber(t.getStepNumber())
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
                                        .build())
                                .toList())
                        .build())
                .toList());
        return resp;
    }
}
