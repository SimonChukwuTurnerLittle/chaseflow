package com.chaseflow.repository;

import com.chaseflow.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByEmail(String email);
    Optional<UserAccount> findByTenantIdAndEmail(UUID tenantId, String email);
    boolean existsByEmail(String email);
    List<UserAccount> findByTenantId(UUID tenantId);
    long countByTenantIdAndDeletedFalse(UUID tenantId);
}
