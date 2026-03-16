package com.chaseflow.repository;

import com.chaseflow.domain.ContactDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContactDetailsRepository extends JpaRepository<ContactDetails, Long> {
    Optional<ContactDetails> findByLeadId(Long leadId);
}
