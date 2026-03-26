package com.chaseflow.controller;

import com.chaseflow.domain.Tenant;
import com.chaseflow.domain.TenantConfig;
import com.chaseflow.domain.UserAccount;
import com.chaseflow.domain.enums.UserRole;
import com.chaseflow.exception.AccessDeniedException;
import com.chaseflow.exception.NotFoundException;
import com.chaseflow.exception.ValidationException;
import com.chaseflow.repository.TenantRepository;
import com.chaseflow.repository.UserAccountRepository;
import com.chaseflow.service.TenantConfigService;
import com.chaseflow.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final TenantRepository tenantRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantConfigService tenantConfigService;
    private final TenantContext tenantContext;

    // ── Account ──

    @GetMapping("/account")
    public ResponseEntity<Map<String, Object>> getAccount() {
        assertHandler();
        Tenant tenant = getTenant();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("businessName", tenant.getName());
        result.put("businessEmail", getCurrentUser().getEmail());
        result.put("businessPhone", "");
        result.put("planTier", tenant.getPlanTier().name());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/account")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateAccount(@RequestBody Map<String, String> body) {
        assertHandler();
        Tenant tenant = getTenant();
        if (body.containsKey("businessName") && body.get("businessName") != null) {
            tenant.setName(body.get("businessName"));
        }
        tenantRepository.save(tenant);
        return getAccount();
    }

    // ── Users ──

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers() {
        assertHandler();
        UUID tenantId = tenantContext.currentTenantId();
        List<UserAccount> users = userAccountRepository.findByTenantId(tenantId);
        Tenant tenant = getTenant();

        int planLimit = switch (tenant.getPlanTier()) {
            case FREE -> 1;
            case STARTER -> 3;
            case GROWTH -> Integer.MAX_VALUE;
        };

        List<Map<String, Object>> userList = new ArrayList<>();
        for (UserAccount u : users) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("email", u.getEmail());
            m.put("role", u.getUserRole().name());
            m.put("verified", u.getVerified());
            m.put("active", !u.getDeleted());
            userList.add(m);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("users", userList);
        result.put("planLimit", planLimit);
        result.put("planTier", tenant.getPlanTier().name());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/users/invite")
    @Transactional
    public ResponseEntity<Map<String, String>> inviteUser(@RequestBody Map<String, String> body) {
        assertAdmin();
        UUID tenantId = tenantContext.currentTenantId();

        String email = body.get("email");
        String role = body.getOrDefault("role", "SALES_USER");

        if (email == null || email.isBlank()) {
            throw new ValidationException("Email is required");
        }

        if (userAccountRepository.findByTenantIdAndEmail(tenantId, email).isPresent()) {
            throw new ValidationException("A user with this email already exists");
        }

        // Enforce plan limits
        Tenant tenant = getTenant();
        long activeUsers = userAccountRepository.countByTenantIdAndDeletedFalse(tenantId);
        int max = switch (tenant.getPlanTier()) {
            case FREE -> 1;
            case STARTER -> 3;
            case GROWTH -> Integer.MAX_VALUE;
        };
        if (activeUsers >= max) {
            throw new ValidationException("User limit reached for " + tenant.getPlanTier().name() + " plan");
        }

        UserAccount newUser = UserAccount.builder()
                .tenantId(tenantId)
                .email(email)
                .username(email.split("@")[0])
                .password(passwordEncoder.encode("changeme123"))
                .userRole(UserRole.valueOf(role))
                .verified(false)
                .deleted(false)
                .build();
        userAccountRepository.save(newUser);

        return ResponseEntity.ok(Map.of("message", "User invited successfully"));
    }

    @PutMapping("/users/{userId}/role")
    @Transactional
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> body) {
        assertAdmin();
        UUID tenantId = tenantContext.currentTenantId();
        UserAccount user = userAccountRepository.findById(userId)
                .filter(u -> u.getTenantId().equals(tenantId))
                .orElseThrow(() -> new NotFoundException("User not found"));

        String role = body.get("role");
        user.setUserRole(UserRole.valueOf(role));
        userAccountRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Role updated"));
    }

    @PutMapping("/users/{userId}/deactivate")
    @Transactional
    public ResponseEntity<Map<String, String>> deactivateUser(@PathVariable UUID userId) {
        assertAdmin();
        UUID tenantId = tenantContext.currentTenantId();
        UserAccount user = userAccountRepository.findById(userId)
                .filter(u -> u.getTenantId().equals(tenantId))
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getId().equals(tenantContext.currentUserId())) {
            throw new ValidationException("You cannot deactivate yourself");
        }

        user.setDeleted(true);
        userAccountRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User deactivated"));
    }

    // ── Chase Config ──

    @GetMapping("/chase-config")
    public ResponseEntity<TenantConfig.ChaseConfig> getChaseConfig() {
        assertHandler();
        return ResponseEntity.ok(tenantConfigService.getConfig().getChase());
    }

    @PutMapping("/chase-config")
    @Transactional
    public ResponseEntity<TenantConfig.ChaseConfig> updateChaseConfig(
            @RequestBody TenantConfig.ChaseConfig chaseConfig) {
        assertAdmin();
        return ResponseEntity.ok(tenantConfigService.updateChaseConfig(chaseConfig));
    }

    // ── Password ──

    @PutMapping("/password")
    @Transactional
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> body) {
        UserAccount user = getCurrentUser();
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ValidationException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new ValidationException("New password must be at least 8 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userAccountRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    // ── Helpers ──

    private Tenant getTenant() {
        return tenantRepository.findById(tenantContext.currentTenantId())
                .orElseThrow(() -> new NotFoundException("Tenant not found"));
    }

    private UserAccount getCurrentUser() {
        return userAccountRepository.findById(tenantContext.currentUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private void assertHandler() {
        UserRole role = tenantContext.currentUserRole();
        if (role == UserRole.EXPLORER || role == UserRole.SALES_USER) {
            throw new AccessDeniedException("You do not have access to account settings");
        }
    }

    private void assertAdmin() {
        if (tenantContext.currentUserRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can manage users");
        }
    }
}
