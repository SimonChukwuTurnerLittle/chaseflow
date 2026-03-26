package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TemplateResponse {
    private UUID id;
    private UUID serviceId;
    private String templateTitle;
    private String templateDescription;
    private String templateType;
    private String subject;
    private String templateContent;
    private String templateContentFormat;
    private Integer version;
    private LocalDateTime timeCreated;
    private LocalDateTime timeUpdated;
    private String createdBy;
    private String updatedBy;
}
