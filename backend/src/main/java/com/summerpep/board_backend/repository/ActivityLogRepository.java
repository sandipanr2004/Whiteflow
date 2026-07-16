package com.summerpep.board_backend.repository;

import com.summerpep.board_backend.model.collaborate.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, String> {
    List<ActivityLog> findByBoardIdOrderByTimestampDesc(String boardId);
}
