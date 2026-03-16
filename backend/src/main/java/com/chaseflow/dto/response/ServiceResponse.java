package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ServiceResponse {
    private Long id;
    private Long serviceCategoryId;
    private String categoryName;
    private String serviceName;
    private String serviceDescription;
    private String serviceMode;
    private BigDecimal price;
    private String packageIncludes;
    private String defaultTemperature;
    private Integer recurrenceDays;
    private Integer sortOrder;
    private LocalDateTime timeCreated;
    private LocalDateTime timeUpdated;
    private List<ChaseSequenceResponse> sequences;
}
