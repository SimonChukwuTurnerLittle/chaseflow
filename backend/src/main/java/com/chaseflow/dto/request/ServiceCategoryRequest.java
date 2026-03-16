package com.chaseflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ServiceCategoryRequest {
    @NotBlank
    private String categoryName;
    private String colourHex;
    private String iconKey;
    private Integer sortOrder;
}
