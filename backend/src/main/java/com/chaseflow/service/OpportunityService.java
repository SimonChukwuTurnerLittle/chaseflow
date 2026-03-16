package com.chaseflow.service;

import com.chaseflow.domain.*;
import com.chaseflow.domain.enums.OpportunityStatus;
import com.chaseflow.domain.enums.Temperature;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.dto.request.OpportunityRequest;
import com.chaseflow.dto.response.OpportunityResponse;
import com.chaseflow.exception.AccessDeniedException;
import com.chaseflow.exception.NotFoundException;
import com.chaseflow.repository.ChaseSequenceRepository;
import com.chaseflow.repository.LeadRepository;
import com.chaseflow.repository.OpportunityRepository;
import com.chaseflow.repository.ServiceRepository;
import com.chaseflow.tenant.TenantContext;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final LeadRepository leadRepository;
    private final ServiceRepository serviceRepository;
    private final ChaseSequenceRepository chaseSequenceRepository;
    private final TenantContext tenantContext;
    private final ObjectMapper objectMapper;

    @Transactional
    public OpportunityResponse createOpportunity(OpportunityRequest request) {
        assertWriteAccess();
        UUID tenantId = tenantContext.currentTenantId();

        Lead lead = leadRepository.findById(request.getLeadId())
                .orElseThrow(() -> new NotFoundException("Lead not found with id: " + request.getLeadId()));
        if (!lead.getTenantId().equals(tenantId)) {
            throw new NotFoundException("Lead not found with id: " + request.getLeadId());
        }

        Temperature temp = request.getTemperature() != null
                ? Temperature.valueOf(request.getTemperature()) : Temperature.MEDIUM;

        Opportunity opportunity = Opportunity.builder()
                .tenantId(tenantId)
                .lead(lead)
                .category(request.getCategory())
                .chaseTechnique(request.getChaseTechnique())
                .chaseMethod(request.getChaseMethod())
                .stage(request.getStage())
                .stageDate(LocalDate.now())
                .temperature(temp)
                .opportunityType(request.getOpportunityType())
                .notes(request.getNotes())
                .currentStep(1)
                .status(OpportunityStatus.ACTIVE)
                .build();

        if (request.getServiceId() != null) {
            com.chaseflow.domain.Service service = serviceRepository.findByIdAndTenantId(request.getServiceId(), tenantId)
                    .orElseThrow(() -> new NotFoundException("Service not found with id: " + request.getServiceId()));
            opportunity.setService(service);
            opportunity.setServiceName(service.getServiceName());

            // Snapshot sequences as JSON
            List<ChaseSequence> sequences = chaseSequenceRepository
                    .findByServiceIdOrderByTemperatureAscStepNumberAsc(service.getId());
            try {
                List<SequenceSnapshotEntry> snapshot = sequences.stream()
                        .map(s -> new SequenceSnapshotEntry(
                                s.getTemperature().name(), s.getStepNumber(), s.getDelayDays(),
                                s.getIsFinalStep(), s.getStopOnReply()))
                        .toList();
                opportunity.setSequenceSnapshot(objectMapper.writeValueAsString(snapshot));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize sequence snapshot", e);
            }

            // Set next chase date from step 1 delay
            chaseSequenceRepository.findByServiceIdAndTemperatureAndStepNumber(service.getId(), temp, 1)
                    .ifPresent(step1 -> opportunity.setNextChaseDate(LocalDate.now().plusDays(step1.getDelayDays())));
        }

        Opportunity saved = opportunityRepository.save(opportunity);
        return toResponse(saved);
    }

    public Page<OpportunityResponse> listOpportunities(String status, Pageable pageable) {
        UUID tenantId = tenantContext.currentTenantId();
        Page<Opportunity> page;
        if (status != null && !status.isBlank()) {
            page = opportunityRepository.findByTenantIdAndStatus(tenantId,
                    OpportunityStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            page = opportunityRepository.findByTenantId(tenantId, pageable);
        }
        return page.map(this::toResponse);
    }

    public OpportunityResponse getOpportunity(UUID id) {
        return toResponse(findByIdAndTenant(id));
    }

    public List<OpportunityResponse> getOpportunitiesForLead(UUID leadId) {
        return opportunityRepository.findByLeadId(leadId).stream()
                .filter(o -> o.getTenantId().equals(tenantContext.currentTenantId()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OpportunityResponse updateOpportunity(UUID id, OpportunityRequest request) {
        assertWriteAccess();
        Opportunity opp = findByIdAndTenant(id);
        opp.setCategory(request.getCategory());
        opp.setChaseTechnique(request.getChaseTechnique());
        opp.setChaseMethod(request.getChaseMethod());
        opp.setStage(request.getStage());
        if (request.getTemperature() != null) {
            opp.setTemperature(Temperature.valueOf(request.getTemperature()));
        }
        opp.setOpportunityType(request.getOpportunityType());
        opp.setNotes(request.getNotes());
        opp = opportunityRepository.save(opp);
        return toResponse(opp);
    }

    @Transactional
    public void deleteOpportunity(UUID id) {
        assertWriteAccess();
        Opportunity opp = findByIdAndTenant(id);
        opp.setDeleted(true);
        opportunityRepository.save(opp);
    }

    @Transactional
    public OpportunityResponse completeOpportunity(UUID id) {
        assertWriteAccess();
        Opportunity opp = findByIdAndTenant(id);
        opp.setStatus(OpportunityStatus.COMPLETED);
        opp.setDateCompleted(LocalDateTime.now());
        opp = opportunityRepository.save(opp);

        // Recurrence: if service has recurrence_days, auto-create new opportunity
        if (opp.getService() != null && opp.getService().getRecurrenceDays() != null) {
            Opportunity recurrence = Opportunity.builder()
                    .tenantId(opp.getTenantId())
                    .lead(opp.getLead())
                    .service(opp.getService())
                    .serviceName(opp.getServiceName())
                    .category(opp.getCategory())
                    .chaseTechnique(opp.getChaseTechnique())
                    .chaseMethod(opp.getChaseMethod())
                    .temperature(opp.getTemperature())
                    .opportunityType(opp.getOpportunityType())
                    .sequenceSnapshot(opp.getSequenceSnapshot())
                    .currentStep(1)
                    .status(OpportunityStatus.ACTIVE)
                    .nextChaseDate(LocalDate.now().plusDays(opp.getService().getRecurrenceDays()))
                    .build();
            opportunityRepository.save(recurrence);
        }

        return toResponse(opp);
    }

    private Opportunity findByIdAndTenant(UUID id) {
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Opportunity not found with id: " + id));
        if (!opp.getTenantId().equals(tenantContext.currentTenantId())) {
            throw new NotFoundException("Opportunity not found with id: " + id);
        }
        return opp;
    }

    private void assertWriteAccess() {
        UserRole role = tenantContext.currentUserRole();
        if (role == UserRole.EXPLORER) {
            throw new AccessDeniedException("Read-only access. Cannot modify opportunities.");
        }
    }

    public OpportunityResponse toResponse(Opportunity o) {
        return OpportunityResponse.builder()
                .id(o.getId())
                .leadId(o.getLead().getId())
                .leadName(o.getLead().getFirstName() + " " +
                        (o.getLead().getLastName() != null ? o.getLead().getLastName() : ""))
                .serviceId(o.getService() != null ? o.getService().getId() : null)
                .serviceName(o.getServiceName())
                .dateAdded(o.getDateAdded())
                .status(o.getStatus().name())
                .category(o.getCategory())
                .chaseTechnique(o.getChaseTechnique())
                .chaseMethod(o.getChaseMethod())
                .stage(o.getStage())
                .stageDate(o.getStageDate())
                .nextChaseDate(o.getNextChaseDate())
                .currentStep(o.getCurrentStep())
                .temperature(o.getTemperature().name())
                .opportunityType(o.getOpportunityType())
                .notes(o.getNotes())
                .dateCompleted(o.getDateCompleted())
                .build();
    }

    record SequenceSnapshotEntry(String temperature, int stepNumber, int delayDays,
                                  boolean isFinalStep, boolean stopOnReply) {}
}
