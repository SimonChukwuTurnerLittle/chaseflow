package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private long totalLeads;
    private long activeOpportunities;
    private long pendingDrafts;
    private List<OpportunityResponse> todaysDueOpportunities;
}
