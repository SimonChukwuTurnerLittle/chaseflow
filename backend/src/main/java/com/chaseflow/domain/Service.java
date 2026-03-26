package com.chaseflow.domain;

import com.chaseflow.domain.enums.ServiceMode;
import com.chaseflow.domain.enums.Temperature;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "service")
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Service extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_category_id")
    private ServiceCategory serviceCategory;

    @Column(name = "service_name", nullable = false)
    private String serviceName;

    @Column(name = "service_description", columnDefinition = "TEXT")
    private String serviceDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_mode", nullable = false)
    private ServiceMode serviceMode;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "package_includes", columnDefinition = "TEXT")
    private String packageIncludes;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_temperature")
    @Builder.Default
    private Temperature defaultTemperature = Temperature.MEDIUM;

    @Column(name = "recurrence_days")
    private Integer recurrenceDays;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    @Column(name = "time_created", nullable = false, updatable = false)
    private LocalDateTime timeCreated;

    @Column(name = "time_updated")
    private LocalDateTime timeUpdated;

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ServiceChannel> channels = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        timeCreated = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        timeUpdated = LocalDateTime.now();
    }
}
