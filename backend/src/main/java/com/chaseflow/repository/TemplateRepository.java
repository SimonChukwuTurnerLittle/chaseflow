package com.chaseflow.repository;

import com.chaseflow.domain.Template;
import com.chaseflow.domain.enums.TemplateType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TemplateRepository extends JpaRepository<Template, UUID> {
    List<Template> findByChaseSequenceId(UUID chaseSequenceId);
    Optional<Template> findByChaseSequenceIdAndTemplateType(UUID chaseSequenceId, TemplateType templateType);
}
