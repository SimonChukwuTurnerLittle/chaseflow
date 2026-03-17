package com.chaseflow.service;

import com.chaseflow.domain.ChaseSequence;
import com.chaseflow.domain.enums.Temperature;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.dto.request.ChaseSequenceRequest;
import com.chaseflow.dto.response.ChaseSequenceResponse;
import com.chaseflow.dto.response.TemplateResponse;
import com.chaseflow.exception.AccessDeniedException;
import com.chaseflow.exception.NotFoundException;
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
public class ChaseSequenceService {

    private final ChaseSequenceRepository chaseSequenceRepository;
    private final ServiceRepository serviceRepository;
    private final TemplateRepository templateRepository;
    private final TenantContext tenantContext;

    @Transactional(readOnly = true)
    public List<ChaseSequenceResponse> listSequences(UUID serviceId) {
        verifyServiceBelongsToTenant(serviceId);
        return chaseSequenceRepository.findByServiceIdOrderByTemperatureAscStepNumberAsc(serviceId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ChaseSequenceResponse addStep(UUID serviceId, ChaseSequenceRequest request) {
        assertAdmin();
        com.chaseflow.domain.Service service = verifyServiceBelongsToTenant(serviceId);

        ChaseSequence seq = ChaseSequence.builder()
                .service(service)
                .temperature(Temperature.valueOf(request.getTemperature()))
                .stepNumber(request.getStepNumber())
                .delayDays(request.getDelayDays() != null ? request.getDelayDays() : 0)
                .isFinalStep(request.getIsFinalStep() != null ? request.getIsFinalStep() : false)
                .stopOnReply(request.getStopOnReply() != null ? request.getStopOnReply() : true)
                .deleted(false)
                .build();

        seq = chaseSequenceRepository.save(seq);
        return toResponse(seq);
    }

    @Transactional
    public ChaseSequenceResponse updateStep(UUID serviceId, UUID id, ChaseSequenceRequest request) {
        assertAdmin();
        verifyServiceBelongsToTenant(serviceId);
        ChaseSequence seq = chaseSequenceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chase sequence not found with id: " + id));
        if (!seq.getService().getId().equals(serviceId)) {
            throw new NotFoundException("Chase sequence not found with id: " + id);
        }

        if (request.getTemperature() != null) seq.setTemperature(Temperature.valueOf(request.getTemperature()));
        if (request.getStepNumber() != null) seq.setStepNumber(request.getStepNumber());
        if (request.getDelayDays() != null) seq.setDelayDays(request.getDelayDays());
        if (request.getIsFinalStep() != null) seq.setIsFinalStep(request.getIsFinalStep());
        if (request.getStopOnReply() != null) seq.setStopOnReply(request.getStopOnReply());

        seq = chaseSequenceRepository.save(seq);
        return toResponse(seq);
    }

    @Transactional
    public void deleteStep(UUID serviceId, UUID id) {
        assertAdmin();
        verifyServiceBelongsToTenant(serviceId);
        ChaseSequence seq = chaseSequenceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chase sequence not found with id: " + id));
        if (!seq.getService().getId().equals(serviceId)) {
            throw new NotFoundException("Chase sequence not found with id: " + id);
        }
        seq.setDeleted(true);
        chaseSequenceRepository.save(seq);
    }

    private com.chaseflow.domain.Service verifyServiceBelongsToTenant(UUID serviceId) {
        return serviceRepository.findByIdAndTenantId(serviceId, tenantContext.currentTenantId())
                .orElseThrow(() -> new NotFoundException("Service not found with id: " + serviceId));
    }

    private void assertAdmin() {
        if (tenantContext.currentUserRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can manage chase sequences");
        }
    }

    private ChaseSequenceResponse toResponse(ChaseSequence seq) {
        UUID serviceId = seq.getService().getId();
        return ChaseSequenceResponse.builder()
                .id(seq.getId())
                .serviceId(serviceId)
                .temperature(seq.getTemperature().name())
                .stepNumber(seq.getStepNumber())
                .delayDays(seq.getDelayDays())
                .isFinalStep(seq.getIsFinalStep())
                .stopOnReply(seq.getStopOnReply())
                .templates(templateRepository.findByServiceIdAndStepNumber(serviceId, seq.getStepNumber()).stream()
                        .map(t -> TemplateResponse.builder()
                                .id(t.getId())
                                .serviceId(serviceId)
                                .stepNumber(seq.getStepNumber())
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
                .build();
    }
}
