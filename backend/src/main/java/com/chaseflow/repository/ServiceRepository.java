package com.chaseflow.repository;

import com.chaseflow.domain.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceRepository extends JpaRepository<Service, UUID> {
    List<Service> findByTenantIdOrderBySortOrder(UUID tenantId);
    List<Service> findByTenantIdAndServiceCategoryIdOrderBySortOrder(UUID tenantId, UUID categoryId);
    Optional<Service> findByIdAndTenantId(UUID id, UUID tenantId);
}
