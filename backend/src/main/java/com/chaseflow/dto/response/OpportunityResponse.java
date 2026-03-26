package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class OpportunityResponse {
    private UUID id;
    private UUID leadId;
    private String leadName;
    private UUID serviceId;
    private String serviceName;
    private String channel;
    private String temperature;
    private Integer currentStep;
    private LocalDate nextChaseDate;
    private String aiGuidanceContext;
    private String stage;
    private LocalDate stageDate;
    private String opportunityType;
    private String status;
    private String notes;
    private String handler;
    private LocalDateTime dateAdded;
    private LocalDateTime dateCompleted;
}
