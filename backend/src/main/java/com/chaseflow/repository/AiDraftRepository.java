package com.chaseflow.repository;

import com.chaseflow.domain.AiDraft;
import com.chaseflow.domain.enums.DraftStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AiDraftRepository extends JpaRepository<AiDraft, UUID> {
    @Query("SELECT d FROM AiDraft d JOIN d.opportunity o WHERE o.tenantId = :tenantId AND d.status = :status")
    Page<AiDraft> findByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") DraftStatus status, Pageable pageable);

    @Query("SELECT d FROM AiDraft d JOIN d.opportunity o WHERE d.id = :id AND o.tenantId = :tenantId")
    Optional<AiDraft> findByIdAndTenantId(@Param("id") UUID id, @Param("tenantId") UUID tenantId);
}
