package com.chaseflow.repository;

import com.chaseflow.domain.RelatedFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RelatedFileRepository extends JpaRepository<RelatedFile, Long> {
    List<RelatedFile> findByLeadIdOrderByDateAddedDesc(Long leadId);
}
