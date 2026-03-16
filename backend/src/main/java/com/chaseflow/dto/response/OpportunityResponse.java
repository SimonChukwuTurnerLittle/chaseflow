package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class OpportunityResponse {
    private Long id;
    private Long leadId;
    private String leadName;
    private Long serviceId;
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
