package com.summerpep.board_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@CrossOrigin(origins = "*")
public class BoardController {

    @Autowired
    private BoardRepository boardRepository;

    @GetMapping
    public List<Board> getAllBoards() {
        // Order by created date or something similar if needed, 
        // for now just find all and sort on frontend or return list.
        return boardRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Board> saveBoard(@RequestBody Board board) {
        if (board.getId() != null) {
            boardRepository.findById(board.getId()).ifPresent(existing -> {
                // Preserve original metadata that shouldn't be overwritten by whiteboard auto-save
                board.setOwner(existing.getOwner());
                board.setDate(existing.getDate());
                board.setCollaborators(existing.getCollaborators());
                board.setVisibility(existing.getVisibility());
                board.setStatus(existing.getStatus());
                
                if (board.getThumbnail() == null || board.getThumbnail().isEmpty()) {
                    board.setThumbnail(existing.getThumbnail());
                }
            });
        }
        Board savedBoard = boardRepository.save(board);
        return ResponseEntity.ok(savedBoard);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoard(@PathVariable String id) {
        return boardRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create/{owner}")
    public ResponseEntity<Board> createBoard(@PathVariable String owner) {
        long count = boardRepository.countByOwner(owner);
        String name = "Untitled Board " + (count + 1);
        String id = java.util.UUID.randomUUID().toString();
        
        Board newBoard = Board.builder()
                .id(id)
                .owner(owner)
                .name(name)
                .date(java.time.Instant.now().toString())
                .status("Active")
                .visibility("Private")
                .desc("New whiteboard session")
                .collaborators(1)
                .thumbnail("")
                .snapshot("")
                .maxParticipants(5)
                .build();
                
        Board savedBoard = boardRepository.save(newBoard);
        return ResponseEntity.ok(savedBoard);
    }

    @Autowired
    private com.summerpep.board_backend.repository.CollaboratorRepository collaboratorRepository;

    @GetMapping("/user/{owner}")
    public List<Board> getBoardsByOwner(@PathVariable String owner) {
        List<Board> boards = new java.util.ArrayList<>(boardRepository.findByOwner(owner));
        
        List<com.summerpep.board_backend.model.collaborate.Collaborator> collabs = collaboratorRepository.findByUserId(owner);
        for (com.summerpep.board_backend.model.collaborate.Collaborator c : collabs) {
            boardRepository.findById(c.getBoardId()).ifPresent(b -> {
                if (boards.stream().noneMatch(existing -> existing.getId().equals(b.getId()))) {
                    boards.add(b);
                }
            });
        }
        
        return boards;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable String id) {
        if (boardRepository.existsById(id)) {
            boardRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/updateOwner")
    public ResponseEntity<?> updateOwner(
            @RequestParam String oldOwner,
            @RequestParam String newOwner) {
        
        // Update all boards owned by oldOwner
        List<Board> boards = boardRepository.findByOwner(oldOwner);
        for (Board board : boards) {
            board.setOwner(newOwner);
            boardRepository.save(board);
        }

        // Update all collaborations where userId is oldOwner
        List<com.summerpep.board_backend.model.collaborate.Collaborator> collabs = collaboratorRepository.findByUserId(oldOwner);
        for (com.summerpep.board_backend.model.collaborate.Collaborator collab : collabs) {
            collab.setUserId(newOwner);
            collaboratorRepository.save(collab);
        }

        return ResponseEntity.ok().build();
    }
}
