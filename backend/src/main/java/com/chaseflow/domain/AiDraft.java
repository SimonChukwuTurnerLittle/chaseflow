package com.chaseflow.domain;

import com.chaseflow.domain.enums.DraftStatus;
import com.chaseflow.domain.enums.TemplateType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_draft")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", nullable = false)
    private TemplateType templateType;

    private String subject;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DraftStatus status = DraftStatus.PENDING;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "time_created", nullable = false, updatable = false)
    private LocalDateTime timeCreated;

    @PrePersist
    protected void onCreate() {
        timeCreated = LocalDateTime.now();
    }
}
