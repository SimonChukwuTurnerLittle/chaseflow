package com.chaseflow.repository;

import com.chaseflow.domain.ChaseSequence;
import com.chaseflow.domain.enums.Temperature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChaseSequenceRepository extends JpaRepository<ChaseSequence, Long> {
    List<ChaseSequence> findByServiceIdOrderByTemperatureAscStepNumberAsc(Long serviceId);
    List<ChaseSequence> findByServiceIdAndTemperatureOrderByStepNumberAsc(Long serviceId, Temperature temperature);
    Optional<ChaseSequence> findByServiceIdAndTemperatureAndStepNumber(Long serviceId, Temperature temperature, Integer stepNumber);
}
