package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ServiceCategoryResponse {
    private Long id;
    private String categoryName;
    private String colourHex;
    private String iconKey;
    private Integer sortOrder;
    private LocalDateTime timeCreated;
    private LocalDateTime timeUpdated;
}
