package com.chaseflow.repository;

import com.chaseflow.domain.RelatedFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RelatedFileRepository extends JpaRepository<RelatedFile, UUID> {
    List<RelatedFile> findByLeadIdOrderByDateAddedDesc(UUID leadId);
}
