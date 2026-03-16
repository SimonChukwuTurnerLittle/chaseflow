package com.chaseflow.repository;

import com.chaseflow.domain.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    List<ServiceCategory> findByTenantIdOrderBySortOrder(Long tenantId);
}
