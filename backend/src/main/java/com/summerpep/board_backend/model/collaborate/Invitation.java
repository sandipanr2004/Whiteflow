package com.summerpep.board_backend.model.collaborate;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String boardId;

    @Column(nullable = false)
    private String inviterId; // User who sent the invite

    @Column(nullable = false)
    private String inviteeEmail;

    @Column(nullable = false)
    private String role; // Target role (EDITOR, VIEWER)

    @Column(nullable = false, unique = true)
    private String token; // Secret token for accepting the invite

    private LocalDateTime expiresAt;
    
    private String status; // PENDING, ACCEPTED, EXPIRED, REJECTED
}
