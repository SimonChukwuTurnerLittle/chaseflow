package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ChaseSequenceResponse {
    private UUID id;
    private UUID serviceId;
    private String temperature;
    private Integer stepNumber;
    private Integer delayDays;
    private Boolean isFinalStep;
    private Boolean stopOnReply;
    private Boolean useAiPersonalisation;
    private String aiPersonalisationGuidance;
    private List<TemplateResponse> templates;
}
