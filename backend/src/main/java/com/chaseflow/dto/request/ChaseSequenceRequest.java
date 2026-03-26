package com.chaseflow.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class ChaseSequenceRequest {
    private Integer stepNumber;
    private Boolean isFinalStep;
    private Boolean stopOnReply;
    private Boolean useAiPersonalisation;
    private String aiPersonalisationGuidance;
    private UUID templateId;
}
