package com.chaseflow.dto.request;

import lombok.Data;

@Data
public class ActivityRequest {
    private String description;
    private String chaseTechnique;
    private String chaseMethod;
    private String templateType;
    private String contentSent;
}
