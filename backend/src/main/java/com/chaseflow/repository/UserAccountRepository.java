package com.chaseflow.repository;

import com.chaseflow.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByEmail(String email);
    Optional<UserAccount> findByTenantIdAndEmail(Long tenantId, String email);
    boolean existsByEmail(String email);
    List<UserAccount> findByTenantId(Long tenantId);
    long countByTenantIdAndDeletedFalse(Long tenantId);
}
