package com.chaseflow.repository;

import com.chaseflow.domain.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByTenantIdOrderBySortOrder(Long tenantId);
    List<Service> findByTenantIdAndServiceCategoryIdOrderBySortOrder(Long tenantId, Long categoryId);
    Optional<Service> findByIdAndTenantId(Long id, Long tenantId);
}
