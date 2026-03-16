package com.chaseflow.repository;

import com.chaseflow.domain.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LeadRepository extends JpaRepository<Lead, UUID> {
    Page<Lead> findByTenantId(UUID tenantId, Pageable pageable);
    Page<Lead> findByTenantIdAndSourceContainingIgnoreCase(UUID tenantId, String source, Pageable pageable);
}
