package com.chaseflow.domain;

import com.chaseflow.domain.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "user_account", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tenant_id", "email"})
})
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    private UserRole userRole;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;
}
