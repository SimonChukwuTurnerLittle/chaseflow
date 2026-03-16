package com.chaseflow.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContactDetailsResponse {
    private Long id;
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
