package com.summerpep.board_backend.repository;

import com.summerpep.board_backend.model.collaborate.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, String> {
    List<Invitation> findByInviteeEmailAndStatus(String email, String status);
    Optional<Invitation> findByToken(String token);
}
