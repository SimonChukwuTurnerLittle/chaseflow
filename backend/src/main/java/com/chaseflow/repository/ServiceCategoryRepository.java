package com.chaseflow.repository;

import com.chaseflow.domain.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, UUID> {
    List<ServiceCategory> findByTenantIdOrderBySortOrder(UUID tenantId);
}
