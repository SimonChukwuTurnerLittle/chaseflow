package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LeadResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String source;
    private String rating;
    private String handler;
    private LocalDateTime dateCreated;
    private ContactDetailsResponse contactDetails;
}
