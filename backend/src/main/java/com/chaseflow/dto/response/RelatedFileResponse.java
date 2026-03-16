package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class RelatedFileResponse {
    private UUID id;
    private String filename;
    private String description;
    private LocalDateTime dateAdded;
    private String user;
    private String fileType;
    private Long fileSize;
    private String s3ObjectKey;
}
