package com.summerpep.board_backend.model.collaborate;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "share_links")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String boardId;

    @Column(name = "share_token", nullable = false, unique = true)
    private String shareToken;

    @Column(name = "access_type", nullable = false)
    private String accessType; // VIEW_ONLY or VIEW_EDIT

    @Column(name = "visibility", nullable = false)
    private String visibility; // PRIVATE or ANYONE_WITH_LINK

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "status", nullable = false)
    private String status; // ACTIVE, EXPIRED, REVOKED

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
