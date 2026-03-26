package com.chaseflow.repository;

import com.chaseflow.domain.ServiceChannel;
import com.chaseflow.domain.enums.ChaseChannel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceChannelRepository extends JpaRepository<ServiceChannel, UUID> {
    List<ServiceChannel> findByServiceId(UUID serviceId);
    Optional<ServiceChannel> findByServiceIdAndChannel(UUID serviceId, ChaseChannel channel);
}
