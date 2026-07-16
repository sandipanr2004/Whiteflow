package com.summerpep.board_backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ShareRequest {
    private String accessType; // VIEW_ONLY or VIEW_EDIT
    private String visibility; // PRIVATE or ANYONE_WITH_LINK
    private LocalDateTime expiresAt;
}
