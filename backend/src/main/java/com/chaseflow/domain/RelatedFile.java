package com.chaseflow.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "related_file")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RelatedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(nullable = false)
    private String filename;

    private String description;

    @Column(name = "date_added", nullable = false, updatable = false)
    private LocalDateTime dateAdded;

    private String user;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "s3_object_key", nullable = false)
    private String s3ObjectKey;

    @PrePersist
    protected void onCreate() {
        dateAdded = LocalDateTime.now();
    }
}
