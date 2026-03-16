package com.chaseflow.repository;

import com.chaseflow.domain.Template;
import com.chaseflow.domain.enums.TemplateType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TemplateRepository extends JpaRepository<Template, Long> {
    List<Template> findByChaseSequenceId(Long chaseSequenceId);
    Optional<Template> findByChaseSequenceIdAndTemplateType(Long chaseSequenceId, TemplateType templateType);
}
