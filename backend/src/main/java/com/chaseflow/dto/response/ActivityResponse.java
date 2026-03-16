package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ActivityResponse {
    private Long id;
    private Long opportunityId;
    private String description;
    private String chaseTechnique;
    private String chaseMethod;
    private String templateType;
    private String contentSent;
    private Boolean aiGenerated;
    private Long aiDraftId;
    private LocalDateTime dateAdded;
    private LocalDateTime activityTime;
    private String user;
}
