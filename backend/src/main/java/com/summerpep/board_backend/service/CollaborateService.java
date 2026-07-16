package com.summerpep.board_backend.service;

import com.summerpep.board_backend.dto.collaborate.InviteRequest;
import com.summerpep.board_backend.dto.collaborate.ShareLinkRequest;
import com.summerpep.board_backend.model.collaborate.*;
import com.summerpep.board_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CollaborateService {

    @Autowired
    private CollaboratorRepository collaboratorRepository;
    
    @Autowired
    private InvitationRepository invitationRepository;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private ActivityLogRepository activityLogRepository;
    
    @Autowired
    private ShareLinkRepository shareLinkRepository;

    @Transactional
    public Invitation inviteUser(String boardId, String inviterId, InviteRequest request) {
        // Basic validation could go here
        
        Invitation invite = Invitation.builder()
                .boardId(boardId)
                .inviterId(inviterId)
                .inviteeEmail(request.getInviteeEmail())
                .role(request.getRole())
                .token(UUID.randomUUID().toString())
                .status("PENDING")
                .expiresAt(LocalDateTime.now().plusDays(7)) // 7 day expiry
                .build();
                
        invitationRepository.save(invite);
        
        logActivity(boardId, inviterId, "INVITED_USER", "Invited " + request.getInviteeEmail() + " as " + request.getRole());
        
        // In a real app, send email here
        System.out.println("Mock Email sent to " + request.getInviteeEmail() + " with token: " + invite.getToken());
        
        return invite;
    }

    @Transactional
    public String acceptInvitation(String token, String currentUserId) {
        Invitation invite = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));
                
        if ("ACCEPTED".equals(invite.getStatus())) {
            throw new RuntimeException("Already accepted");
        }
        if (invite.getExpiresAt() != null && invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            invite.setStatus("EXPIRED");
            invitationRepository.save(invite);
            throw new RuntimeException("Invitation expired");
        }
        
        invite.setStatus("ACCEPTED");
        invitationRepository.save(invite);
        
        Collaborator collab = Collaborator.builder()
                .boardId(invite.getBoardId())
                .userId(currentUserId)
                .role(invite.getRole())
                .status("OFFLINE")
                .lastActive(LocalDateTime.now())
                .pendingInvitation(false)
                .build();
                
        collaboratorRepository.save(collab);
        logActivity(invite.getBoardId(), currentUserId, "ACCEPTED_INVITE", "User joined board as " + invite.getRole());
        
        return invite.getBoardId();
    }

    @Autowired
    private com.summerpep.board_backend.BoardRepository boardRepository;

    public List<Collaborator> getMembers(String boardId) {
        List<Collaborator> members = new java.util.ArrayList<>(collaboratorRepository.findByBoardId(boardId));
        
        java.util.Optional<com.summerpep.board_backend.Board> boardOpt = boardRepository.findById(boardId);
        if (boardOpt.isPresent()) {
            com.summerpep.board_backend.Board board = boardOpt.get();
            Collaborator owner = Collaborator.builder()
                    .id("owner-" + boardId)
                    .boardId(boardId)
                    .userId(board.getOwner())
                    .role("OWNER")
                    .status("ONLINE")
                    .lastActive(LocalDateTime.now())
                    .pendingInvitation(false)
                    .build();
            members.add(0, owner);
        }
        
        return members;
    }

    @Transactional
    public void updateRole(String boardId, String updaterId, String targetUserId, String newRole) {
        Collaborator collab = collaboratorRepository.findByBoardIdAndUserId(boardId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Collaborator not found"));
                
        collab.setRole(newRole);
        collaboratorRepository.save(collab);
        
        logActivity(boardId, updaterId, "UPDATED_ROLE", "Updated user " + targetUserId + " to " + newRole);
    }

    @Transactional
    public void removeCollaborator(String boardId, String removerId, String targetUserId) {
        collaboratorRepository.deleteByBoardIdAndUserId(boardId, targetUserId);
        logActivity(boardId, removerId, "REMOVED_USER", "Removed user " + targetUserId);
    }

    public List<Invitation> getPendingInvitations(String email) {
        return invitationRepository.findByInviteeEmailAndStatus(email, "PENDING");
    }

    public List<ActivityLog> getHistory(String boardId) {
        return activityLogRepository.findByBoardIdOrderByTimestampDesc(boardId);
    }

    public List<ChatMessage> getChat(String boardId) {
        return chatMessageRepository.findByBoardIdOrderByTimestampAsc(boardId);
    }
    
    @Transactional
    public ChatMessage saveChatMessage(String boardId, String senderId, String content) {
        ChatMessage message = ChatMessage.builder()
                .boardId(boardId)
                .senderId(senderId)
                .content(content)
                .timestamp(LocalDateTime.now())
                .build();
        return chatMessageRepository.save(message);
    }

    @Transactional
    public ShareLink generateLink(String boardId, String creatorId, ShareLinkRequest request) {
        ShareLink link = ShareLink.builder()
                .boardId(boardId)
                .shareToken(UUID.randomUUID().toString().replace("-", "")) // short code
                .accessType(request.getRole() != null ? request.getRole() : "VIEW_ONLY")
                .visibility("ANYONE_WITH_LINK") // Default
                .expiresAt(request.getExpiresInMinutes() != null ? LocalDateTime.now().plusMinutes(request.getExpiresInMinutes()) : null)
                .status("ACTIVE")
                .createdBy(creatorId)
                .build();
                
        shareLinkRepository.save(link);
        logActivity(boardId, creatorId, "GENERATED_LINK", "Generated public link for role " + request.getRole());
        
        return link;
    }

    @Transactional
    public void revokeLink(String boardId, String revokerId, String linkId) {
        shareLinkRepository.findById(linkId).ifPresent(link -> {
            link.setStatus("REVOKED");
            shareLinkRepository.save(link);
            logActivity(boardId, revokerId, "REVOKED_LINK", "Revoked public link");
        });
    }

    private void logActivity(String boardId, String userId, String action, String details) {
        ActivityLog log = ActivityLog.builder()
                .boardId(boardId)
                .userId(userId)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
    }
}
