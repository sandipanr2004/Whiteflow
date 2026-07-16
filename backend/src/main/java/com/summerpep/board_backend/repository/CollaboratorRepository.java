package com.summerpep.board_backend.repository;

import com.summerpep.board_backend.model.collaborate.Collaborator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollaboratorRepository extends JpaRepository<Collaborator, String> {
    List<Collaborator> findByBoardId(String boardId);
    List<Collaborator> findByUserId(String userId);
    Optional<Collaborator> findByBoardIdAndUserId(String boardId, String userId);
    void deleteByBoardIdAndUserId(String boardId, String userId);
}
