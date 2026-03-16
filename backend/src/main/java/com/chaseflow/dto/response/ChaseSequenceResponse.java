package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ChaseSequenceResponse {
    private Long id;
    private Long serviceId;
    private String temperature;
    private Integer stepNumber;
    private Integer delayDays;
    private Boolean isFinalStep;
    private Boolean stopOnReply;
    private List<TemplateResponse> templates;
}
