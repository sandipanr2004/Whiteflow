package com.summerpep.board_backend;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "boards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {

    @Id
    private String id;
    
    private String name;
    
    @Column(name = "created_date")
    private String date;
    
    private String status;
    private String visibility;
    @Column(name = "description")
    private String desc;
    private Integer collaborators;
    
    @Column(name = "thumbnail", columnDefinition = "TEXT")
    private String thumbnail;
    
    @Column(name = "snapshot", columnDefinition = "TEXT")
    private String snapshot;
    
    private String owner;

    @Column(name = "max_participants")
    @Builder.Default
    private Integer maxParticipants = 5;
}
