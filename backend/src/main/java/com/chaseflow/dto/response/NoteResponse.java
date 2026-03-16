package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NoteResponse {
    private Long id;
    private String description;
    private String user;
    private LocalDateTime dateAdded;
}
