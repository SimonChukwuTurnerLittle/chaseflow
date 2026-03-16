package com.chaseflow.repository;

import com.chaseflow.domain.AiDraft;
import com.chaseflow.domain.enums.DraftStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AiDraftRepository extends JpaRepository<AiDraft, Long> {
    @Query("SELECT d FROM AiDraft d JOIN d.opportunity o WHERE o.tenantId = :tenantId AND d.status = :status")
    Page<AiDraft> findByTenantIdAndStatus(@Param("tenantId") Long tenantId, @Param("status") DraftStatus status, Pageable pageable);
}
