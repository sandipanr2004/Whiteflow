package com.summerpep.board_backend.controller;

import com.summerpep.board_backend.config.JwtUtil;
import com.summerpep.board_backend.dto.ShareRequest;
import com.summerpep.board_backend.model.collaborate.ShareLink;
import com.summerpep.board_backend.model.collaborate.Collaborator;
import com.summerpep.board_backend.repository.CollaboratorRepository;
import com.summerpep.board_backend.BoardRepository;
import com.summerpep.board_backend.Board;
import com.summerpep.board_backend.service.ShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ShareController {

    @Autowired
    private ShareService shareService;

    @Autowired
    private CollaboratorRepository collaboratorRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String getUsernameFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                return jwtUtil.extractUsername(token);
            }
        }
        return "anonymous"; // Fallback, shouldn't happen with proper auth
    }

    @PostMapping("/boards/{boardId}/share")
    public ResponseEntity<ShareLink> generateLink(
            @PathVariable String boardId,
            @RequestBody ShareRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        String username = getUsernameFromHeader(authHeader);
        ShareLink link = shareService.generateShareLink(
                boardId, username, request.getAccessType(), request.getVisibility(), request.getExpiresAt());
        return ResponseEntity.ok(link);
    }

    @GetMapping("/boards/{boardId}/share")
    public ResponseEntity<List<ShareLink>> getLinks(@PathVariable String boardId) {
        return ResponseEntity.ok(shareService.getLinksForBoard(boardId));
    }

    @PatchMapping("/boards/{boardId}/share/{linkId}")
    public ResponseEntity<ShareLink> updatePermission(
            @PathVariable String boardId,
            @PathVariable String linkId,
            @RequestBody ShareRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        String username = getUsernameFromHeader(authHeader);
        Optional<ShareLink> updated = shareService.updateSharePermission(linkId, request.getAccessType(), request.getVisibility(), username);
        return updated.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/boards/{boardId}/share/{linkId}")
    public ResponseEntity<?> revokeLink(
            @PathVariable String boardId,
            @PathVariable String linkId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        String username = getUsernameFromHeader(authHeader);
        boolean revoked = shareService.revokeLink(linkId, username);
        if (revoked) {
            return ResponseEntity.ok(Map.of("message", "Link revoked successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Link not found"));
    }

    @GetMapping("/share/{token}/validate")
    public ResponseEntity<?> validateToken(@PathVariable String token) {
        Optional<ShareLink> link = shareService.validateToken(token);
        if (link.isPresent()) {
            return ResponseEntity.ok(link.get());
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Invalid or expired token"));
    }

    @Autowired
    private com.summerpep.board_backend.service.RoomSessionService roomSessionService;

    @PostMapping("/share/{token}/join")
    public ResponseEntity<?> joinBoard(
            @PathVariable String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Guest-Name", required = false) String guestName) {
        
        Optional<ShareLink> link = shareService.validateToken(token);
        if (link.isPresent()) {
            String username = getUsernameFromHeader(authHeader);
            String boardId = link.get().getBoardId();
            
            if ("anonymous".equals(username) && guestName != null && !guestName.trim().isEmpty()) {
                String cleanGuestName = guestName.trim();
                
                // Check if this exact name is currently connected
                List<Map<String, Object>> activeUsers = roomSessionService.getRoomUsers(boardId);
                boolean isNameTaken = activeUsers.stream()
                        .anyMatch(u -> cleanGuestName.equals(u.get("userName")) || 
                                       ("Guest: " + cleanGuestName).equals(u.get("userName")));
                
                if (isNameTaken) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of("message", "Username already in use by a connected collaborator"));
                }
                
                username = "Guest: " + cleanGuestName;
            }
            
            String finalUsername = username;
            
            // Add user as collaborator if they aren't already
            if (!"anonymous".equals(username)) {
                List<Collaborator> existing = collaboratorRepository.findByBoardId(boardId);
                boolean isMember = existing.stream().anyMatch(c -> c.getUserId().equals(finalUsername));
                
                if (!isMember) {
                    Collaborator collab = Collaborator.builder()
                            .boardId(boardId)
                            .userId(username)
                            .role(link.get().getAccessType())
                            .status("OFFLINE")
                            .lastActive(LocalDateTime.now())
                            .pendingInvitation(false)
                            .build();
                    collaboratorRepository.save(collab);
                    
                    // Increment board collaborators count
                    Optional<Board> boardOpt = boardRepository.findById(boardId);
                    if (boardOpt.isPresent()) {
                        Board board = boardOpt.get();
                        board.setCollaborators((board.getCollaborators() == null ? 1 : board.getCollaborators()) + 1);
                        boardRepository.save(board);
                    }
                }
            }
            
            shareService.logAction(boardId, username, "ACCESSED", "User accessed board via share link");
            return ResponseEntity.ok(Map.of("boardId", boardId, "accessType", link.get().getAccessType()));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Invalid or expired token"));
    }
}
