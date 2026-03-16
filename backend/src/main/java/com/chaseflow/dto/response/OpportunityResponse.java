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
    private LocalDateTime dateAdded;
    private String status;
    private String category;
    private String chaseTechnique;
    private String chaseMethod;
    private String stage;
    private LocalDate stageDate;
    private LocalDate nextChaseDate;
    private Integer currentStep;
    private String temperature;
    private String opportunityType;
    private String notes;
    private LocalDateTime dateCompleted;
}
