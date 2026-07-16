package com.summerpep.board_backend.dto.collaborate;

import lombok.Data;

@Data
public class ShareLinkRequest {
    private String role;
    private Long expiresInMinutes; // Optional expiration
}
