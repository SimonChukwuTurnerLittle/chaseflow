package com.chaseflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeadRequest {
    @NotBlank
    private String firstName;
    private String lastName;
    @NotBlank
    private String source;
    private String rating;
    private String handler;

    // Contact details
    private String email;
    private String phone;
    private String mobile;
    private String whatsapp;
    private String addressLine;
    private String postcode;
    private String city;
    private String county;
    private String country;
}
