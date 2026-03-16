package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class LeadResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String source;
    private String rating;
    private String handler;
    private LocalDateTime dateCreated;
    private ContactDetailsResponse contactDetails;
}
