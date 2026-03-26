package com.chaseflow.domain;

import com.chaseflow.domain.enums.ChaseChannel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_channel", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"service_id", "channel"})
})
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceChannel extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChaseChannel channel;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    @OneToMany(mappedBy = "serviceChannel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChaseSequence> chaseSequences = new ArrayList<>();
}
