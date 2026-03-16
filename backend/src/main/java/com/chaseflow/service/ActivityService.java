package com.chaseflow.service;

import com.chaseflow.domain.Activity;
import com.chaseflow.domain.Opportunity;
import com.chaseflow.domain.enums.TemplateType;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.dto.request.ActivityRequest;
import com.chaseflow.dto.response.ActivityResponse;
import com.chaseflow.exception.AccessDeniedException;
import com.chaseflow.exception.NotFoundException;
import com.chaseflow.repository.ActivityRepository;
import com.chaseflow.repository.OpportunityRepository;
import com.chaseflow.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final OpportunityRepository opportunityRepository;
    private final TenantContext tenantContext;

    public List<ActivityResponse> listActivities(Long opportunityId) {
        findOpportunityByIdAndTenant(opportunityId);
        return activityRepository.findByOpportunityIdOrderByDateAddedDesc(opportunityId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ActivityResponse logActivity(Long opportunityId, ActivityRequest request) {
        assertWriteAccess();
        Opportunity opp = findOpportunityByIdAndTenant(opportunityId);

        Activity activity = Activity.builder()
                .opportunity(opp)
                .description(request.getDescription())
                .chaseTechnique(request.getChaseTechnique())
                .chaseMethod(request.getChaseMethod())
                .templateType(request.getTemplateType() != null
                        ? TemplateType.valueOf(request.getTemplateType()) : null)
                .contentSent(request.getContentSent())
                .aiGenerated(false)
                .user(tenantContext.currentUsername())
                .build();

        activity = activityRepository.save(activity);
        return toResponse(activity);
    }

    private Opportunity findOpportunityByIdAndTenant(Long id) {
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
            throw new AccessDeniedException("Read-only access. Cannot log activities.");
        }
    }

    private ActivityResponse toResponse(Activity a) {
        return ActivityResponse.builder()
                .id(a.getId())
                .opportunityId(a.getOpportunity().getId())
                .description(a.getDescription())
                .chaseTechnique(a.getChaseTechnique())
                .chaseMethod(a.getChaseMethod())
                .templateType(a.getTemplateType() != null ? a.getTemplateType().name() : null)
                .contentSent(a.getContentSent())
                .aiGenerated(a.getAiGenerated())
                .aiDraftId(a.getAiDraftId())
                .dateAdded(a.getDateAdded())
                .activityTime(a.getActivityTime())
                .user(a.getUser())
                .build();
    }
}
