package com.chaseflow.dto.request;

import lombok.Data;

@Data
public class OpportunityRequest {
    private Long leadId;
    private Long serviceId;
    private String category;
    private String chaseTechnique;
    private String chaseMethod;
    private String stage;
    private String temperature;
    private String opportunityType;
    private String notes;
}
