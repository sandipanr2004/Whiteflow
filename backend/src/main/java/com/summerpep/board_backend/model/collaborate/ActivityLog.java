package com.summerpep.board_backend.model.collaborate;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String boardId;

    @Column(nullable = false)
    private String userId; // The user who performed the action

    @Column(nullable = false)
    private String action; // e.g., "INVITED_USER", "UPDATED_ROLE", "EXPORTED_BOARD"

    @Column(columnDefinition = "TEXT")
    private String details; // JSON or text description

    private LocalDateTime timestamp;
}
