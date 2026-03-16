package com.chaseflow.controller;

import com.chaseflow.dto.request.LoginRequest;
import com.chaseflow.dto.request.RegisterRequest;
import com.chaseflow.dto.response.AuthResponse;
import com.chaseflow.exception.NotFoundException;
import com.chaseflow.repository.UserAccountRepository;
import com.chaseflow.service.UserAccountService;
import com.chaseflow.tenant.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserAccountService userAccountService;
    private final UserAccountRepository userAccountRepository;
    private final TenantContext tenantContext;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userAccountService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userAccountService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe() {
        var user = userAccountRepository.findByEmail(tenantContext.currentUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return ResponseEntity.ok(AuthResponse.builder()
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getUserRole().name())
                .tenantId(tenantContext.currentTenantId())
                .build());
    }
}
