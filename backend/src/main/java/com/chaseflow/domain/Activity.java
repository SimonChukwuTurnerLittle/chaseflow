package com.chaseflow.domain;

import com.chaseflow.domain.enums.TemplateType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "chase_technique")
    private String chaseTechnique;

    @Column(name = "chase_method")
    private String chaseMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_type")
    private TemplateType templateType;

    @Column(name = "content_sent", columnDefinition = "LONGTEXT")
    private String contentSent;

    @Column(name = "ai_generated", nullable = false)
    @Builder.Default
    private Boolean aiGenerated = false;

    @Column(name = "ai_draft_id")
    private Long aiDraftId;

    @Column(name = "date_added", nullable = false, updatable = false)
    private LocalDateTime dateAdded;

    @Column(name = "activity_time")
    private LocalDateTime activityTime;

    private String user;

    @PrePersist
    protected void onCreate() {
        dateAdded = LocalDateTime.now();
        if (activityTime == null) {
            activityTime = LocalDateTime.now();
        }
    }
}
