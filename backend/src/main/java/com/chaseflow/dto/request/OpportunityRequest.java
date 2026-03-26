package com.chaseflow.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class OpportunityRequest {
    private UUID leadId;
    private UUID serviceId;
    private String channel;
    private String temperature;
    private String stage;
    private String opportunityType;
    private String aiGuidanceContext;
    private String notes;
    private LocalDate nextChaseDate;
}
