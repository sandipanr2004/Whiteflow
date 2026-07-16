package com.summerpep.board_backend.controller;

import com.summerpep.board_backend.dto.collaborate.InviteRequest;
import com.summerpep.board_backend.dto.collaborate.ShareLinkRequest;
import com.summerpep.board_backend.dto.collaborate.UpdateRoleRequest;
import com.summerpep.board_backend.model.collaborate.*;
import com.summerpep.board_backend.service.CollaborateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collaborate")
@CrossOrigin(origins = "*")
public class CollaborateController {

    @Autowired
    private CollaborateService collaborateService;

    // A real app would extract the user ID from the JWT token via SecurityContext
    // For this demonstration, we'll accept it as a header
    
    @PostMapping("/invite")
    public ResponseEntity<Invitation> inviteUser(
            @RequestHeader("X-User-Id") String inviterId,
            @RequestParam("boardId") String boardId,
            @RequestBody InviteRequest request) {
        return ResponseEntity.ok(collaborateService.inviteUser(boardId, inviterId, request));
    }

    @PostMapping("/invitation/{token}/accept")
    public ResponseEntity<String> acceptInvitation(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String token) {
        String boardId = collaborateService.acceptInvitation(token, userId);
        return ResponseEntity.ok(boardId);
    }

    @GetMapping("/board/{boardId}/members")
    public ResponseEntity<List<Collaborator>> getMembers(@PathVariable String boardId) {
        return ResponseEntity.ok(collaborateService.getMembers(boardId));
    }

    @PutMapping("/board/{boardId}/member/{userId}")
    public ResponseEntity<Void> updateRole(
            @RequestHeader("X-User-Id") String updaterId,
            @PathVariable String boardId,
            @PathVariable String userId,
            @RequestBody UpdateRoleRequest request) {
        collaborateService.updateRole(boardId, updaterId, userId, request.getRole());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/board/{boardId}/member/{userId}")
    public ResponseEntity<Void> removeMember(
            @RequestHeader("X-User-Id") String removerId,
            @PathVariable String boardId,
            @PathVariable String userId) {
        collaborateService.removeCollaborator(boardId, removerId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/invitations/pending")
    public ResponseEntity<List<Invitation>> getPendingInvitations(@RequestParam String email) {
        return ResponseEntity.ok(collaborateService.getPendingInvitations(email));
    }

    @GetMapping("/board/{boardId}/history")
    public ResponseEntity<List<ActivityLog>> getHistory(@PathVariable String boardId) {
        return ResponseEntity.ok(collaborateService.getHistory(boardId));
    }

    @GetMapping("/board/{boardId}/chat")
    public ResponseEntity<List<ChatMessage>> getChat(@PathVariable String boardId) {
        return ResponseEntity.ok(collaborateService.getChat(boardId));
    }

    @PostMapping("/board/{boardId}/link")
    public ResponseEntity<ShareLink> generateLink(
            @RequestHeader("X-User-Id") String creatorId,
            @PathVariable String boardId,
            @RequestBody ShareLinkRequest request) {
        return ResponseEntity.ok(collaborateService.generateLink(boardId, creatorId, request));
    }

    @DeleteMapping("/board/{boardId}/link/{linkId}")
    public ResponseEntity<Void> revokeLink(
            @RequestHeader("X-User-Id") String revokerId,
            @PathVariable String boardId,
            @PathVariable String linkId) {
        collaborateService.revokeLink(boardId, revokerId, linkId);
        return ResponseEntity.ok().build();
    }
}
