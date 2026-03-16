package com.chaseflow.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "lead")
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(nullable = false)
    private String source;

    private String rating;

    private String handler;

    @Column(name = "date_created", nullable = false, updatable = false)
    private LocalDateTime dateCreated;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    @OneToOne(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContactDetails contactDetails;

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Note> notes = new ArrayList<>();

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RelatedFile> relatedFiles = new ArrayList<>();

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Opportunity> opportunities = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        dateCreated = LocalDateTime.now();
    }
}
