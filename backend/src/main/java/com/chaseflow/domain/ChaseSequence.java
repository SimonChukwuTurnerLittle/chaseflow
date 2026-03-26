package com.chaseflow.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "chase_sequence", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"service_channel_id", "step_number"})
})
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChaseSequence extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_channel_id", nullable = false)
    private ServiceChannel serviceChannel;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(name = "is_final_step", nullable = false)
    @Builder.Default
    private Boolean isFinalStep = false;

    @Column(name = "stop_on_reply", nullable = false)
    @Builder.Default
    private Boolean stopOnReply = true;

    @Column(name = "use_ai_personalisation", nullable = false)
    @Builder.Default
    private Boolean useAiPersonalisation = false;

    @Column(name = "ai_personalisation_guidance", columnDefinition = "TEXT")
    private String aiPersonalisationGuidance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private Template template;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;
}
