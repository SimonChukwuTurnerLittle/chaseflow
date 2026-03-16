package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AiDraftResponse {
    private Long id;
    private Long opportunityId;
    private String leadName;
    private String serviceName;
    private String templateType;
    private String subject;
    private String content;
    private String status;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private LocalDateTime timeCreated;
}
