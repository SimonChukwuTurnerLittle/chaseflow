package com.chaseflow.dto.request;

import lombok.Data;

@Data
public class TemplateRequest {
    private String templateType;
    private String templateTitle;
    private String templateDescription;
    private String subject;
    private String templateContent;
    private String templateContentFormat;
}
