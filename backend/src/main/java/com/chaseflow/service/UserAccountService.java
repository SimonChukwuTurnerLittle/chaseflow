package com.chaseflow.service;

import com.chaseflow.config.JwtTokenProvider;
import com.chaseflow.domain.Tenant;
import com.chaseflow.domain.UserAccount;
import com.chaseflow.domain.enums.PlanTier;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.dto.request.LoginRequest;
import com.chaseflow.dto.request.RegisterRequest;
import com.chaseflow.dto.response.AuthResponse;
import com.chaseflow.exception.ValidationException;
import com.chaseflow.repository.TenantRepository;
import com.chaseflow.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserAccountService {

    private final TenantRepository tenantRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (tenantRepository.existsBySlug(request.getTenantSlug())) {
            throw new ValidationException("Tenant slug already exists");
        }
        if (userAccountRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already registered");
        }

        Tenant tenant = Tenant.builder()
                .name(request.getTenantName())
                .slug(request.getTenantSlug())
                .planTier(PlanTier.FREE)
                .build();
        tenant = tenantRepository.save(tenant);

        UserAccount user = UserAccount.builder()
                .tenantId(tenant.getId())
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .userRole(UserRole.ADMIN)
                .verified(true)
                .deleted(false)
                .build();
        user = userAccountRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getUserRole().name())
                .tenantId(tenant.getId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String token = jwtTokenProvider.generateToken(authentication);

        UserAccount user = userAccountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ValidationException("User not found"));

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getUserRole().name())
                .tenantId(user.getTenantId())
                .build();
    }

    public void enforceUserLimit(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ValidationException("Tenant not found"));
        long activeUsers = userAccountRepository.countByTenantIdAndDeletedFalse(tenantId);
        int max = switch (tenant.getPlanTier()) {
            case FREE -> 1;
            case STARTER -> 3;
            case GROWTH -> Integer.MAX_VALUE;
        };
        if (activeUsers >= max) {
            throw new ValidationException(
                    "User limit reached for plan tier " + tenant.getPlanTier().name() +
                    ". Maximum " + max + " active users allowed.");
        }
    }
}
