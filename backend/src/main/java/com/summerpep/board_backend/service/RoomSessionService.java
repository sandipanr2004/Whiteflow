package com.summerpep.board_backend.service;

import com.summerpep.board_backend.Board;
import com.summerpep.board_backend.BoardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomSessionService {

    // roomId -> set of userIds currently in the room
    private final ConcurrentHashMap<String, Set<String>> activeRooms = new ConcurrentHashMap<>();
    // roomId -> map of userId -> user info (name, joinedAt, color)
    private final ConcurrentHashMap<String, ConcurrentHashMap<String, Map<String, Object>>> roomUserInfo = new ConcurrentHashMap<>();

    @Autowired
    private BoardRepository boardRepository;

    /**
     * Try to join a room. Returns true if successful, false if room is full.
     */
    public synchronized boolean joinRoom(String roomId, String userId, String userName) {
        Set<String> users = activeRooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet());

        // If user is already in the room, allow re-join
        if (users.contains(userId)) {
            return true;
        }

        int maxParticipants = getMaxParticipants(roomId);
        if (users.size() >= maxParticipants) {
            return false; // Room is full
        }

        users.add(userId);

        // Store user info
        ConcurrentHashMap<String, Map<String, Object>> userInfoMap = roomUserInfo.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>());
        Map<String, Object> info = new HashMap<>();
        info.put("userId", userId);
        info.put("userName", userName != null ? userName : userId);
        info.put("joinedAt", LocalDateTime.now().toString());
        info.put("color", generateUserColor(users.size()));
        userInfoMap.put(userId, info);

        return true;
    }

    /**
     * Remove a user from a room.
     */
    public synchronized void leaveRoom(String roomId, String userId) {
        Set<String> users = activeRooms.get(roomId);
        if (users != null) {
            users.remove(userId);
            if (users.isEmpty()) {
                activeRooms.remove(roomId);
                roomUserInfo.remove(roomId);
            } else {
                ConcurrentHashMap<String, Map<String, Object>> userInfoMap = roomUserInfo.get(roomId);
                if (userInfoMap != null) {
                    userInfoMap.remove(userId);
                }
            }
        }
    }

    /**
     * Get all active users in a room.
     */
    public List<Map<String, Object>> getRoomUsers(String roomId) {
        ConcurrentHashMap<String, Map<String, Object>> userInfoMap = roomUserInfo.get(roomId);
        if (userInfoMap == null) return Collections.emptyList();
        return new ArrayList<>(userInfoMap.values());
    }

    /**
     * Get current user count for a room.
     */
    public int getUserCount(String roomId) {
        Set<String> users = activeRooms.get(roomId);
        return users != null ? users.size() : 0;
    }

    /**
     * Check if room has space.
     */
    public boolean hasSpace(String roomId) {
        int maxParticipants = getMaxParticipants(roomId);
        return getUserCount(roomId) < maxParticipants;
    }

    private int getMaxParticipants(String roomId) {
        return boardRepository.findById(roomId)
                .map(Board::getMaxParticipants)
                .orElse(5); // Default to 5
    }

    private String generateUserColor(int index) {
        String[] colors = {"#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"};
        return colors[(index - 1) % colors.length];
    }
}
