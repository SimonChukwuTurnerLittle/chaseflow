package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ServiceCategoryResponse {
    private UUID id;
    private String categoryName;
    private String colourHex;
    private String iconKey;
    private Integer sortOrder;
    private LocalDateTime timeCreated;
    private LocalDateTime timeUpdated;
}
