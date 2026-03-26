package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ChaseSequenceResponse {
    private UUID id;
    private UUID serviceChannelId;
    private String channel;
    private Integer stepNumber;
    private Boolean isFinalStep;
    private Boolean stopOnReply;
    private Boolean useAiPersonalisation;
    private String aiPersonalisationGuidance;
    private TemplateResponse template;
}
