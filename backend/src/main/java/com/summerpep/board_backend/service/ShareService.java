package com.summerpep.board_backend.service;

import com.summerpep.board_backend.model.collaborate.ActivityLog;
import com.summerpep.board_backend.model.collaborate.ShareLink;
import com.summerpep.board_backend.repository.ActivityLogRepository;
import com.summerpep.board_backend.repository.ShareLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ShareService {

    @Autowired
    private ShareLinkRepository shareLinkRepository;

    @Autowired
    private ActivityLogRepository logRepository;

    public ShareLink generateShareLink(String boardId, String createdBy, String accessType, String visibility, LocalDateTime expiresAt) {
        ShareLink link = ShareLink.builder()
                .boardId(boardId)
                .shareToken(UUID.randomUUID().toString().replace("-", ""))
                .accessType(accessType)
                .visibility(visibility)
                .expiresAt(expiresAt)
                .status("ACTIVE")
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .build();
        
        ShareLink saved = shareLinkRepository.save(link);
        logAction(boardId, createdBy, "GENERATED", "Generated link: " + saved.getShareToken());
        return saved;
    }

    public List<ShareLink> getLinksForBoard(String boardId) {
        return shareLinkRepository.findByBoardId(boardId);
    }

    public Optional<ShareLink> updateSharePermission(String linkId, String accessType, String visibility, String modifiedBy) {
        return shareLinkRepository.findById(linkId).map(link -> {
            link.setAccessType(accessType != null ? accessType : link.getAccessType());
            link.setVisibility(visibility != null ? visibility : link.getVisibility());
            ShareLink updated = shareLinkRepository.save(link);
            logAction(link.getBoardId(), modifiedBy, "MODIFIED", "Updated permissions for link: " + link.getShareToken());
            return updated;
        });
    }

    public boolean revokeLink(String linkId, String revokedBy) {
        return shareLinkRepository.findById(linkId).map(link -> {
            link.setStatus("REVOKED");
            shareLinkRepository.save(link);
            logAction(link.getBoardId(), revokedBy, "REVOKED", "Revoked link: " + link.getShareToken());
            return true;
        }).orElse(false);
    }

    public Optional<ShareLink> validateToken(String token) {
        return shareLinkRepository.findByShareToken(token).filter(link -> {
            if ("REVOKED".equals(link.getStatus())) return false;
            if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(LocalDateTime.now())) {
                link.setStatus("EXPIRED");
                shareLinkRepository.save(link);
                return false;
            }
            return true;
        });
    }

    public void logAction(String boardId, String userId, String action, String details) {
        ActivityLog log = ActivityLog.builder()
                .boardId(boardId)
                .userId(userId)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        logRepository.save(log);
    }
}
