package com.chaseflow.dto.request;

import lombok.Data;

@Data
public class ChaseSequenceRequest {
    private String temperature;
    private Integer stepNumber;
    private Integer delayDays;
    private Boolean isFinalStep;
    private Boolean stopOnReply;
}
