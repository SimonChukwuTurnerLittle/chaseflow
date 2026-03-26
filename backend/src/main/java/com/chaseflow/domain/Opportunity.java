package com.chaseflow.domain;

import com.chaseflow.domain.enums.ChaseChannel;
import com.chaseflow.domain.enums.OpportunityStatus;
import com.chaseflow.domain.enums.Temperature;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "opportunity")
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Opportunity extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private Service service;

    @Column(name = "service_name")
    private String serviceName;

    @Enumerated(EnumType.STRING)
    private ChaseChannel channel;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Temperature temperature = Temperature.MEDIUM;

    @Column(name = "current_step", nullable = false)
    @Builder.Default
    private Integer currentStep = 1;

    @Column(name = "next_chase_date")
    private LocalDate nextChaseDate;

    @Column(name = "ai_guidance_context", columnDefinition = "TEXT")
    private String aiGuidanceContext;

    private String stage;

    @Column(name = "stage_date")
    private LocalDate stageDate;

    @Column(name = "opportunity_type")
    private String opportunityType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OpportunityStatus status = OpportunityStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "date_added", nullable = false, updatable = false)
    private LocalDateTime dateAdded;

    @Column(name = "date_completed")
    private LocalDateTime dateCompleted;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    @OneToMany(mappedBy = "opportunity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Activity> activities = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        dateAdded = LocalDateTime.now();
    }
}
