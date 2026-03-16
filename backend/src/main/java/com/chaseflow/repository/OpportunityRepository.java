package com.chaseflow.repository;

import com.chaseflow.domain.Opportunity;
import com.chaseflow.domain.enums.OpportunityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    Page<Opportunity> findByTenantId(Long tenantId, Pageable pageable);
    Page<Opportunity> findByTenantIdAndStatus(Long tenantId, OpportunityStatus status, Pageable pageable);
    List<Opportunity> findByLeadId(Long leadId);

    @Query("SELECT o FROM Opportunity o WHERE o.nextChaseDate <= :today AND o.status = :status AND o.deleted = false")
    List<Opportunity> findDueOpportunities(@Param("today") LocalDate today, @Param("status") OpportunityStatus status);

    long countByTenantIdAndStatus(Long tenantId, OpportunityStatus status);

    @Query("SELECT o FROM Opportunity o WHERE o.tenantId = :tenantId AND o.nextChaseDate = :today AND o.status = 'ACTIVE' AND o.deleted = false")
    List<Opportunity> findTodaysDueOpportunities(@Param("tenantId") Long tenantId, @Param("today") LocalDate today);
}
