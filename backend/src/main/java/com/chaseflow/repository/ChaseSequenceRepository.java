package com.chaseflow.repository;

import com.chaseflow.domain.ChaseSequence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChaseSequenceRepository extends JpaRepository<ChaseSequence, UUID> {
    List<ChaseSequence> findByServiceChannelIdOrderByStepNumberAsc(UUID serviceChannelId);
    Optional<ChaseSequence> findByServiceChannelIdAndStepNumber(UUID serviceChannelId, Integer stepNumber);
}
