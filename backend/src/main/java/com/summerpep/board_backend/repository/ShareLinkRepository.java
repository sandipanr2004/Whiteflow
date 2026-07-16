package com.summerpep.board_backend.repository;

import com.summerpep.board_backend.model.collaborate.ShareLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShareLinkRepository extends JpaRepository<ShareLink, String> {
    Optional<ShareLink> findByShareToken(String shareToken);
    List<ShareLink> findByBoardId(String boardId);
}
