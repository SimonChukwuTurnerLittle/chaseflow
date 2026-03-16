package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RelatedFileResponse {
    private Long id;
    private String filename;
    private String description;
    private LocalDateTime dateAdded;
    private String user;
    private String fileType;
    private Long fileSize;
    private String s3ObjectKey;
}
