package com.chaseflow.repository;

import com.chaseflow.domain.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface LeadRepository extends JpaRepository<Lead, UUID> {
    Page<Lead> findByTenantId(UUID tenantId, Pageable pageable);
    Page<Lead> findByTenantIdAndSourceContainingIgnoreCase(UUID tenantId, String source, Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.tenantId = :tenantId" +
           " AND (:search IS NULL OR LOWER(CONCAT(l.firstName, ' ', COALESCE(l.lastName, ''))) LIKE LOWER(CONCAT('%', :search, '%')))" +
           " AND (:source IS NULL OR LOWER(l.source) LIKE LOWER(CONCAT('%', :source, '%')))" +
           " AND (:rating IS NULL OR l.rating = :rating)" +
           " AND (:dateFrom IS NULL OR l.dateCreated >= :dateFrom)" +
           " AND (:dateTo IS NULL OR l.dateCreated <= :dateTo)")
    Page<Lead> searchLeads(@Param("tenantId") UUID tenantId,
                           @Param("search") String search,
                           @Param("source") String source,
                           @Param("rating") String rating,
                           @Param("dateFrom") LocalDateTime dateFrom,
                           @Param("dateTo") LocalDateTime dateTo,
                           Pageable pageable);
}
