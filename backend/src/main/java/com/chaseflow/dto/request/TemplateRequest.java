package com.chaseflow.dto.request;

import lombok.Data;

@Data
public class TemplateRequest {
    private String templateTitle;
    private String templateDescription;
    private String subject;
    private String templateContent;
    private String templateContentFormat;
    private String aiPromptHint;
    private Boolean useAi;
}
