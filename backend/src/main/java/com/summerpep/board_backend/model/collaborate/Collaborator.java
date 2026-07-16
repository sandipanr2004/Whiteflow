package com.summerpep.board_backend.model.collaborate;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "collaborators")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Collaborator {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String boardId;

    @Column(nullable = false)
    private String userId; // The email or ID of the user

    @Column(nullable = false)
    private String role; // OWNER, EDITOR, VIEWER

    private String status; // ONLINE, OFFLINE

    private LocalDateTime lastActive;

    private boolean pendingInvitation;
}
