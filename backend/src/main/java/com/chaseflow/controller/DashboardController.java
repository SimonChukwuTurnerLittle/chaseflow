package com.chaseflow.controller;

import com.chaseflow.domain.enums.DraftStatus;
import com.chaseflow.domain.enums.OpportunityStatus;
import com.chaseflow.dto.response.DashboardResponse;
import com.chaseflow.dto.response.OpportunityResponse;
import com.chaseflow.repository.AiDraftRepository;
import com.chaseflow.repository.LeadRepository;
import com.chaseflow.repository.OpportunityRepository;
import com.chaseflow.service.OpportunityService;
import com.chaseflow.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final LeadRepository leadRepository;
    private final OpportunityRepository opportunityRepository;
    private final AiDraftRepository aiDraftRepository;
    private final OpportunityService opportunityService;
    private final TenantContext tenantContext;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<DashboardResponse> getDashboard() {
        UUID tenantId = tenantContext.currentTenantId();

        long totalLeads = leadRepository.findByTenantId(tenantId, Pageable.unpaged()).getTotalElements();
        long activeOpportunities = opportunityRepository.countByTenantIdAndStatus(tenantId, OpportunityStatus.ACTIVE);
        long pendingDrafts = aiDraftRepository.findByTenantIdAndStatus(tenantId, DraftStatus.PENDING, Pageable.unpaged()).getTotalElements();

        List<OpportunityResponse> todaysDue = opportunityRepository
                .findTodaysDueOpportunities(tenantId, LocalDate.now())
                .stream()
                .map(opportunityService::toResponse)
                .toList();

        return ResponseEntity.ok(DashboardResponse.builder()
                .totalLeads(totalLeads)
                .activeOpportunities(activeOpportunities)
                .pendingDrafts(pendingDrafts)
                .todaysDueOpportunities(todaysDue)
                .build());
    }
}
