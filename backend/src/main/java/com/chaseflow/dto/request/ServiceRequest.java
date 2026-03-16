package com.chaseflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceRequest {
    private Long serviceCategoryId;
    @NotBlank
    private String serviceName;
    private String serviceDescription;
    @NotNull
    private String serviceMode;
    private BigDecimal price;
    private String packageIncludes;
    private String defaultTemperature;
    private Integer recurrenceDays;
    private Integer sortOrder;
}
