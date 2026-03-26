package com.chaseflow.service;

import com.chaseflow.domain.*;
import com.chaseflow.domain.enums.ChaseChannel;
import com.chaseflow.domain.enums.OpportunityStatus;
import com.chaseflow.domain.enums.Temperature;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.dto.request.OpportunityRequest;
import com.chaseflow.dto.response.OpportunityResponse;
import com.chaseflow.exception.AccessDeniedException;
import com.chaseflow.exception.NotFoundException;
import com.chaseflow.repository.LeadRepository;
import com.chaseflow.repository.OpportunityRepository;
import com.chaseflow.repository.ServiceRepository;
import com.chaseflow.repository.TenantConfigRepository;
import com.chaseflow.tenant.TenantContext;
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
    private final TenantConfigRepository tenantConfigRepository;
    private final TenantContext tenantContext;

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

        ChaseChannel channel = request.getChannel() != null
                ? ChaseChannel.valueOf(request.getChannel()) : null;

        Opportunity opportunity = Opportunity.builder()
                .tenantId(tenantId)
                .lead(lead)
                .channel(channel)
                .temperature(temp)
                .stage(request.getStage())
                .stageDate(LocalDate.now())
                .opportunityType(request.getOpportunityType())
                .aiGuidanceContext(request.getAiGuidanceContext())
                .notes(request.getNotes())
                .currentStep(1)
                .status(OpportunityStatus.ACTIVE)
                .build();

        if (request.getServiceId() != null) {
            com.chaseflow.domain.Service service = serviceRepository.findByIdAndTenantId(request.getServiceId(), tenantId)
                    .orElseThrow(() -> new NotFoundException("Service not found with id: " + request.getServiceId()));
            opportunity.setService(service);
            opportunity.setServiceName(service.getServiceName());

            // Calculate nextChaseDate from TenantConfig
            if (request.getNextChaseDate() == null) {
                TenantConfig config = tenantConfigRepository.findByTenantId(tenantId).orElse(null);
                if (config != null) {
                    int delayDays = config.getDelayDaysForTemperature(temp);
                    opportunity.setNextChaseDate(LocalDate.now().plusDays(delayDays));
                }
            }
        }

        // Allow explicit nextChaseDate to override
        if (request.getNextChaseDate() != null) {
            opportunity.setNextChaseDate(request.getNextChaseDate());
        }

        Opportunity saved = opportunityRepository.save(opportunity);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<OpportunityResponse> listOpportunities(String search, String status, String temperature,
                                                        String service, String dateFrom, String dateTo,
                                                        Pageable pageable) {
        UUID tenantId = tenantContext.currentTenantId();

        OpportunityStatus statusEnum = (status != null && !status.isBlank())
                ? OpportunityStatus.valueOf(status.toUpperCase()) : null;
        Temperature tempEnum = (temperature != null && !temperature.isBlank())
                ? Temperature.valueOf(temperature.toUpperCase()) : null;
        String serviceName = (service != null && !service.isBlank()) ? service : null;
        String searchTerm = (search != null && !search.isBlank()) ? search : null;

        LocalDateTime from = (dateFrom != null && !dateFrom.isBlank())
                ? LocalDate.parse(dateFrom).atStartOfDay() : null;
        LocalDateTime to = (dateTo != null && !dateTo.isBlank())
                ? LocalDate.parse(dateTo).atTime(23, 59, 59) : null;

        Page<Opportunity> page = opportunityRepository.searchOpportunities(
                tenantId, searchTerm, statusEnum, tempEnum, from, to, serviceName, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OpportunityResponse getOpportunity(UUID id) {
        return toResponse(findByIdAndTenant(id));
    }

    @Transactional(readOnly = true)
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

        if (request.getChannel() != null) {
            opp.setChannel(ChaseChannel.valueOf(request.getChannel()));
        }
        opp.setStage(request.getStage());
        if (request.getTemperature() != null) {
            opp.setTemperature(Temperature.valueOf(request.getTemperature()));
        }
        opp.setOpportunityType(request.getOpportunityType());
        opp.setAiGuidanceContext(request.getAiGuidanceContext());
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
                    .channel(opp.getChannel())
                    .temperature(opp.getTemperature())
                    .opportunityType(opp.getOpportunityType())
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
                .channel(o.getChannel() != null ? o.getChannel().name() : null)
                .temperature(o.getTemperature().name())
                .currentStep(o.getCurrentStep())
                .nextChaseDate(o.getNextChaseDate())
                .aiGuidanceContext(o.getAiGuidanceContext())
                .stage(o.getStage())
                .stageDate(o.getStageDate())
                .opportunityType(o.getOpportunityType())
                .status(o.getStatus().name())
                .notes(o.getNotes())
                .handler(o.getLead().getHandler())
                .dateAdded(o.getDateAdded())
                .dateCompleted(o.getDateCompleted())
                .build();
    }
}
