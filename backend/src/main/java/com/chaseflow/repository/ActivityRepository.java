package com.chaseflow.repository;

import com.chaseflow.domain.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {
    List<Activity> findByOpportunityIdOrderByDateAddedDesc(UUID opportunityId);
    List<Activity> findByOpportunityLeadIdOrderByDateAddedDesc(UUID leadId);
}
