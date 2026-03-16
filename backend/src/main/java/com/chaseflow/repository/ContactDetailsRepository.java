package com.chaseflow.repository;

import com.chaseflow.domain.ContactDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ContactDetailsRepository extends JpaRepository<ContactDetails, UUID> {
    Optional<ContactDetails> findByLeadId(UUID leadId);
}
