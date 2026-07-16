package com.summerpep.board_backend.repository;

import com.summerpep.board_backend.model.collaborate.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByBoardIdOrderByTimestampAsc(String boardId);
}
