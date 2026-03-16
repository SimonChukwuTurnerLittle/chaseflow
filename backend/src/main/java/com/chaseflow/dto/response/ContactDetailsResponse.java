package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ContactDetailsResponse {
    private UUID id;
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
