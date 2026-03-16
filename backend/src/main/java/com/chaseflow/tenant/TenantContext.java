package com.chaseflow.tenant;

import com.chaseflow.domain.enums.UserRole;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TenantContext {

    private static final ThreadLocal<UUID> TENANT_ID = new ThreadLocal<>();
    private static final ThreadLocal<UUID> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<UserRole> USER_ROLE = new ThreadLocal<>();
    private static final ThreadLocal<String> USERNAME = new ThreadLocal<>();

    public void setTenantId(UUID tenantId) {
        TENANT_ID.set(tenantId);
    }

    public UUID currentTenantId() {
        return TENANT_ID.get();
    }

    public void setUserId(UUID userId) {
        USER_ID.set(userId);
    }

    public UUID currentUserId() {
        return USER_ID.get();
    }

    public void setUserRole(UserRole role) {
        USER_ROLE.set(role);
    }

    public UserRole currentUserRole() {
        return USER_ROLE.get();
    }

    public void setUsername(String username) {
        USERNAME.set(username);
    }

    public String currentUsername() {
        return USERNAME.get();
    }

    public void clear() {
        TENANT_ID.remove();
        USER_ID.remove();
        USER_ROLE.remove();
        USERNAME.remove();
    }
}
