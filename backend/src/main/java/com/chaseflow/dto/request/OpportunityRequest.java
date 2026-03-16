package com.chaseflow.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class OpportunityRequest {
    private UUID leadId;
    private UUID serviceId;
    private String category;
    private String chaseTechnique;
    private String chaseMethod;
    private String stage;
    private String temperature;
    private String opportunityType;
    private String notes;
}
