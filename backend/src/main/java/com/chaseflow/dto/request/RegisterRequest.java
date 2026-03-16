package com.chaseflow.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String tenantName;

    @NotBlank
    private String tenantSlug;

    @NotBlank
    private String username;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 8)
    private String password;
}
