package com.chaseflow.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "note")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String user;

    @Column(name = "date_added", nullable = false, updatable = false)
    private LocalDateTime dateAdded;

    @PrePersist
    protected void onCreate() {
        dateAdded = LocalDateTime.now();
    }
}
