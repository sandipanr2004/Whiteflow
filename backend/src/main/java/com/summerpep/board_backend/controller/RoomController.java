package com.summerpep.board_backend.controller;

import com.summerpep.board_backend.Board;
import com.summerpep.board_backend.BoardRepository;
import com.summerpep.board_backend.service.RoomSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    @Autowired
    private RoomSessionService roomSessionService;

    @Autowired
    private BoardRepository boardRepository;

    @GetMapping("/{roomId}/status")
    public ResponseEntity<Map<String, Object>> getRoomStatus(@PathVariable String roomId) {
        Map<String, Object> status = new HashMap<>();
        status.put("roomId", roomId);
        status.put("userCount", roomSessionService.getUserCount(roomId));
        status.put("users", roomSessionService.getRoomUsers(roomId));
        status.put("hasSpace", roomSessionService.hasSpace(roomId));

        int maxParticipants = boardRepository.findById(roomId)
                .map(Board::getMaxParticipants)
                .orElse(5);
        status.put("maxParticipants", maxParticipants);

        return ResponseEntity.ok(status);
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<Map<String, Object>> joinRoom(
            @PathVariable String roomId,
            @RequestBody Map<String, String> payload) {

        String userId = payload.getOrDefault("userId", "anonymous");
        String userName = payload.getOrDefault("userName", userId);

        boolean joined = roomSessionService.joinRoom(roomId, userId, userName);

        Map<String, Object> response = new HashMap<>();
        response.put("success", joined);
        response.put("userCount", roomSessionService.getUserCount(roomId));
        response.put("users", roomSessionService.getRoomUsers(roomId));

        if (!joined) {
            response.put("message", "Room is full. Maximum 5 participants allowed.");
            return ResponseEntity.status(403).body(response);
        }

        return ResponseEntity.ok(response);
    }
}
