package com.chaseflow.domain;

import com.chaseflow.domain.enums.Temperature;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chase_sequence", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"service_id", "temperature", "step_number"})
})
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChaseSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Temperature temperature;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(name = "delay_days", nullable = false)
    @Builder.Default
    private Integer delayDays = 0;

    @Column(name = "is_final_step", nullable = false)
    @Builder.Default
    private Boolean isFinalStep = false;

    @Column(name = "stop_on_reply", nullable = false)
    @Builder.Default
    private Boolean stopOnReply = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    @OneToMany(mappedBy = "chaseSequence", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Template> templates = new ArrayList<>();
}
