package com.chaseflow.tenant;

import com.chaseflow.domain.UserAccount;
import com.chaseflow.repository.UserAccountRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class TenantInterceptor implements HandlerInterceptor {

    private final TenantContext tenantContext;
    private final UserAccountRepository userAccountRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            String email = authentication.getName();
            userAccountRepository.findByEmail(email).ifPresent(user -> {
                tenantContext.setTenantId(user.getTenantId());
                tenantContext.setUserId(user.getId());
                tenantContext.setUserRole(user.getUserRole());
                tenantContext.setUsername(user.getUsername());
            });
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        tenantContext.clear();
    }
}
