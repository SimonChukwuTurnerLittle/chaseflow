package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class NoteResponse {
    private UUID id;
    private String description;
    private String user;
    private LocalDateTime dateAdded;
}
