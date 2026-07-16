package com.summerpep.board_backend.controller;

import com.summerpep.board_backend.service.RoomSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.Map;

@Controller
@CrossOrigin(origins = "*")
public class CollaborationController {

    @Autowired
    private com.summerpep.board_backend.service.CollaborateService collaborateService;

    @Autowired
    private RoomSessionService roomSessionService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/draw/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public String handleDrawUpdate(@DestinationVariable String roomId, String message) {
        return message;
    }

    @MessageMapping("/draw/sync-request/{roomId}")
    @SendTo("/topic/room/sync-request/{roomId}")
    public String handleSyncRequest(@DestinationVariable String roomId, String message) {
        return message;
    }

    @MessageMapping("/draw/sync-response/{roomId}")
    @SendTo("/topic/room/sync-response/{roomId}")
    public String handleSyncResponse(@DestinationVariable String roomId, String message) {
        return message;
    }

    @MessageMapping("/room/join/{roomId}")
    public void handleJoinRoom(@DestinationVariable String roomId, String message) {
        try {
            // Simple JSON parsing without Jackson
            String userId = extractJsonValue(message, "userId");
            String userName = extractJsonValue(message, "userName");
            if (userId == null) userId = "anonymous";
            if (userName == null) userName = userId;

            boolean joined = roomSessionService.joinRoom(roomId, userId, userName);

            if (joined) {
                StringBuilder sb = new StringBuilder();
                sb.append("{\"type\":\"USER_JOINED\",");
                sb.append("\"userId\":\"").append(escapeJson(userId)).append("\",");
                sb.append("\"userName\":\"").append(escapeJson(userName)).append("\",");
                sb.append("\"userCount\":").append(roomSessionService.getUserCount(roomId)).append(",");
                sb.append("\"users\":").append(usersToJson(roomId));
                sb.append("}");

                messagingTemplate.convertAndSend("/topic/room/presence/" + roomId, sb.toString());
            } else {
                String response = "{\"type\":\"ROOM_FULL\",\"message\":\"Room is full. Maximum 5 participants allowed.\",\"maxParticipants\":5}";
                messagingTemplate.convertAndSend("/topic/room/presence/" + roomId, response);
            }
        } catch (Exception e) {
            System.err.println("Error handling room join: " + e.getMessage());
        }
    }

    @MessageMapping("/room/leave/{roomId}")
    public void handleLeaveRoom(@DestinationVariable String roomId, String message) {
        try {
            String userId = extractJsonValue(message, "userId");
            if (userId == null) userId = "anonymous";

            roomSessionService.leaveRoom(roomId, userId);

            StringBuilder sb = new StringBuilder();
            sb.append("{\"type\":\"USER_LEFT\",");
            sb.append("\"userId\":\"").append(escapeJson(userId)).append("\",");
            sb.append("\"userCount\":").append(roomSessionService.getUserCount(roomId)).append(",");
            sb.append("\"users\":").append(usersToJson(roomId));
            sb.append("}");

            messagingTemplate.convertAndSend("/topic/room/presence/" + roomId, sb.toString());
        } catch (Exception e) {
            System.err.println("Error handling room leave: " + e.getMessage());
        }
    }

    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/chat/{roomId}")
    public String handleChat(@DestinationVariable String roomId, String message, org.springframework.messaging.simp.SimpMessageHeaderAccessor headerAccessor) {
        String userId = "user-" + (int)(Math.random() * 1000);
        collaborateService.saveChatMessage(roomId, userId, message);
        return message;
    }

    // ---- Helper methods ----

    private String extractJsonValue(String json, String key) {
        if (json == null) return null;
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex < 0) return null;
        
        int colonIndex = json.indexOf(':', keyIndex + searchKey.length());
        if (colonIndex < 0) return null;
        
        // Find the start of the value (skip whitespace)
        int valueStart = colonIndex + 1;
        while (valueStart < json.length() && json.charAt(valueStart) == ' ') valueStart++;
        
        if (valueStart >= json.length()) return null;
        
        if (json.charAt(valueStart) == '"') {
            // String value
            int valueEnd = json.indexOf('"', valueStart + 1);
            if (valueEnd < 0) return null;
            return json.substring(valueStart + 1, valueEnd);
        }
        
        return null;
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String usersToJson(String roomId) {
        java.util.List<Map<String, Object>> users = roomSessionService.getRoomUsers(roomId);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < users.size(); i++) {
            if (i > 0) sb.append(",");
            Map<String, Object> u = users.get(i);
            sb.append("{");
            sb.append("\"userId\":\"").append(escapeJson(String.valueOf(u.get("userId")))).append("\",");
            sb.append("\"userName\":\"").append(escapeJson(String.valueOf(u.get("userName")))).append("\",");
            sb.append("\"color\":\"").append(escapeJson(String.valueOf(u.get("color")))).append("\",");
            sb.append("\"joinedAt\":\"").append(escapeJson(String.valueOf(u.get("joinedAt")))).append("\"");
            sb.append("}");
        }
        sb.append("]");
        return sb.toString();
    }
}
