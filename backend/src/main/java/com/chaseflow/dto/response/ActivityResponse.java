package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ActivityResponse {
    private UUID id;
    private UUID opportunityId;
    private String description;
    private String chaseTechnique;
    private String chaseMethod;
    private String templateType;
    private String contentSent;
    private Boolean aiGenerated;
    private UUID aiDraftId;
    private LocalDateTime dateAdded;
    private LocalDateTime activityTime;
    private String user;
}
