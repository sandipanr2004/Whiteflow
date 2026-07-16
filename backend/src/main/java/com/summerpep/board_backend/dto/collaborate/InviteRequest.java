package com.summerpep.board_backend.dto.collaborate;

import lombok.Data;

@Data
public class InviteRequest {
    private String inviteeEmail;
    private String role; // EDITOR, VIEWER
}
