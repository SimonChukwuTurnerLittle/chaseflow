package com.chaseflow.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contact_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactDetails extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", unique = true, nullable = false)
    private Lead lead;

    private String email;

    private String phone;

    private String mobile;

    private String whatsapp;

    @Column(name = "address_line")
    private String addressLine;

    private String postcode;

    private String city;

    private String county;

    private String country;
}
