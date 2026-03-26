package com.chaseflow.service;

import com.chaseflow.domain.ChaseSequence;
import com.chaseflow.domain.ServiceChannel;
import com.chaseflow.domain.Template;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.dto.request.ChaseSequenceRequest;
import com.chaseflow.dto.response.ChaseSequenceResponse;
import com.chaseflow.dto.response.TemplateResponse;
import com.chaseflow.exception.AccessDeniedException;
import com.chaseflow.exception.NotFoundException;
import com.chaseflow.repository.ChaseSequenceRepository;
import com.chaseflow.repository.ServiceChannelRepository;
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
    private final ServiceChannelRepository serviceChannelRepository;
    private final ServiceRepository serviceRepository;
    private final TemplateRepository templateRepository;
    private final TenantContext tenantContext;

    @Transactional(readOnly = true)
    public List<ChaseSequenceResponse> listSequences(UUID serviceId, UUID channelId) {
        verifyServiceBelongsToTenant(serviceId);
        ServiceChannel sc = findServiceChannel(channelId, serviceId);
        return chaseSequenceRepository.findByServiceChannelIdOrderByStepNumberAsc(sc.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ChaseSequenceResponse addStep(UUID serviceId, UUID channelId, ChaseSequenceRequest request) {
        assertAdmin();
        verifyServiceBelongsToTenant(serviceId);
        ServiceChannel sc = findServiceChannel(channelId, serviceId);

        ChaseSequence seq = ChaseSequence.builder()
                .serviceChannel(sc)
                .stepNumber(request.getStepNumber())
                .isFinalStep(request.getIsFinalStep() != null ? request.getIsFinalStep() : false)
                .stopOnReply(request.getStopOnReply() != null ? request.getStopOnReply() : true)
                .useAiPersonalisation(request.getUseAiPersonalisation() != null ? request.getUseAiPersonalisation() : false)
                .aiPersonalisationGuidance(request.getAiPersonalisationGuidance())
                .deleted(false)
                .build();

        if (request.getTemplateId() != null) {
            Template template = templateRepository.findById(request.getTemplateId())
                    .orElseThrow(() -> new NotFoundException("Template not found with id: " + request.getTemplateId()));
            seq.setTemplate(template);
        }

        seq = chaseSequenceRepository.save(seq);
        return toResponse(seq);
    }

    @Transactional
    public ChaseSequenceResponse updateStep(UUID serviceId, UUID channelId, UUID id, ChaseSequenceRequest request) {
        assertAdmin();
        verifyServiceBelongsToTenant(serviceId);
        ServiceChannel sc = findServiceChannel(channelId, serviceId);

        ChaseSequence seq = chaseSequenceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chase sequence not found with id: " + id));
        if (!seq.getServiceChannel().getId().equals(sc.getId())) {
            throw new NotFoundException("Chase sequence not found with id: " + id);
        }

        if (request.getStepNumber() != null) seq.setStepNumber(request.getStepNumber());
        if (request.getIsFinalStep() != null) seq.setIsFinalStep(request.getIsFinalStep());
        if (request.getStopOnReply() != null) seq.setStopOnReply(request.getStopOnReply());
        if (request.getUseAiPersonalisation() != null) seq.setUseAiPersonalisation(request.getUseAiPersonalisation());
        seq.setAiPersonalisationGuidance(request.getAiPersonalisationGuidance());

        if (request.getTemplateId() != null) {
            Template template = templateRepository.findById(request.getTemplateId())
                    .orElseThrow(() -> new NotFoundException("Template not found with id: " + request.getTemplateId()));
            seq.setTemplate(template);
        }

        seq = chaseSequenceRepository.save(seq);
        return toResponse(seq);
    }

    @Transactional
    public void deleteStep(UUID serviceId, UUID channelId, UUID id) {
        assertAdmin();
        verifyServiceBelongsToTenant(serviceId);
        ServiceChannel sc = findServiceChannel(channelId, serviceId);

        ChaseSequence seq = chaseSequenceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chase sequence not found with id: " + id));
        if (!seq.getServiceChannel().getId().equals(sc.getId())) {
            throw new NotFoundException("Chase sequence not found with id: " + id);
        }
        seq.setDeleted(true);
        chaseSequenceRepository.save(seq);
    }

    private ServiceChannel findServiceChannel(UUID channelId, UUID serviceId) {
        ServiceChannel sc = serviceChannelRepository.findById(channelId)
                .orElseThrow(() -> new NotFoundException("Service channel not found with id: " + channelId));
        if (!sc.getService().getId().equals(serviceId)) {
            throw new NotFoundException("Service channel not found with id: " + channelId);
        }
        return sc;
    }

    private void verifyServiceBelongsToTenant(UUID serviceId) {
        serviceRepository.findByIdAndTenantId(serviceId, tenantContext.currentTenantId())
                .orElseThrow(() -> new NotFoundException("Service not found with id: " + serviceId));
    }

    private void assertAdmin() {
        if (tenantContext.currentUserRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can manage chase sequences");
        }
    }

    private ChaseSequenceResponse toResponse(ChaseSequence seq) {
        Template t = seq.getTemplate();
        return ChaseSequenceResponse.builder()
                .id(seq.getId())
                .serviceChannelId(seq.getServiceChannel().getId())
                .channel(seq.getServiceChannel().getChannel().name())
                .stepNumber(seq.getStepNumber())
                .isFinalStep(seq.getIsFinalStep())
                .stopOnReply(seq.getStopOnReply())
                .useAiPersonalisation(seq.getUseAiPersonalisation())
                .aiPersonalisationGuidance(seq.getAiPersonalisationGuidance())
                .template(t != null ? TemplateResponse.builder()
                        .id(t.getId())
                        .serviceId(seq.getServiceChannel().getService().getId())
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
                        .build() : null)
                .build();
    }
}
