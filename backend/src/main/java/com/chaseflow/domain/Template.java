package com.chaseflow.domain;

import com.chaseflow.domain.enums.ContentFormat;
import com.chaseflow.domain.enums.TemplateType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "template", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"chase_sequence_id", "template_type"})
})
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Template extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chase_sequence_id", nullable = false)
    private ChaseSequence chaseSequence;

    @Column(name = "template_title")
    private String templateTitle;

    @Column(name = "template_description", length = 500)
    private String templateDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", nullable = false)
    private TemplateType templateType;

    @Column(length = 255)
    private String subject;

    @Column(name = "template_content", columnDefinition = "LONGTEXT")
    private String templateContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_content_format", nullable = false)
    @Builder.Default
    private ContentFormat templateContentFormat = ContentFormat.HTML;

    @Column(name = "ai_prompt_hint", columnDefinition = "TEXT")
    private String aiPromptHint;

    @Column(name = "use_ai", nullable = false)
    @Builder.Default
    private Boolean useAi = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    @Column(name = "time_created", nullable = false, updatable = false)
    private LocalDateTime timeCreated;

    @Column(name = "time_updated")
    private LocalDateTime timeUpdated;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        timeCreated = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        timeUpdated = LocalDateTime.now();
        version = version + 1;
    }
}
