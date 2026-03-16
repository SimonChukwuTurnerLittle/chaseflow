package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TemplateResponse {
    private Long id;
    private Long serviceId;
    private Long chaseSequenceId;
    private String templateTitle;
    private String templateDescription;
    private String templateType;
    private String subject;
    private String templateContent;
    private String templateContentFormat;
    private String aiPromptHint;
    private Boolean useAi;
    private Integer version;
    private LocalDateTime timeCreated;
    private LocalDateTime timeUpdated;
    private String createdBy;
    private String updatedBy;
}
