package com.summerpep.board_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, String> {
    List<Board> findByOwner(String owner);
    long countByOwner(String owner);
}
