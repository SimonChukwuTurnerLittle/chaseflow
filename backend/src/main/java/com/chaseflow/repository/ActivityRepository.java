package com.chaseflow.repository;

import com.chaseflow.domain.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByOpportunityIdOrderByDateAddedDesc(Long opportunityId);
}
