package com.chaseflow.repository;

import com.chaseflow.domain.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    Page<Lead> findByTenantId(Long tenantId, Pageable pageable);
    Page<Lead> findByTenantIdAndSourceContainingIgnoreCase(Long tenantId, String source, Pageable pageable);
}
