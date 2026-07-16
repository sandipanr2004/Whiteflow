package com.summerpep.auth_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allows requests from the frontend
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TurnstileService turnstileService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @RequestBody User user,
            @RequestHeader(value = "CF-Turnstile-Response", required = false) String turnstileToken) {

        if (!turnstileService.verifyToken(turnstileToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Security check failed. Please try again."));
        }
        if (user.getUsername() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password are required"));
        }

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username already exists"));
        }

        // In a real application, you should hash the password here (e.g., BCrypt)
        // user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        userRepository.save(user);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "User created successfully",
                "username", user.getUsername()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User loginRequest,
            @RequestHeader(value = "CF-Turnstile-Response", required = false) String turnstileToken) {

        if (!turnstileService.verifyToken(turnstileToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Security check failed. Please try again."));
        }
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }
        
        User user = userOpt.get();
        // In a real application, verify hash: passwordEncoder.matches(...)
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }
        
        // Generate real JWT
        String token = jwtUtil.generateToken(user.getUsername());
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("username", user.getUsername());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String tokenHeader) {
        if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
        }
        String token = tokenHeader.substring(7);
        boolean isValid = jwtUtil.validateToken(token);
        if (isValid) {
            String username = jwtUtil.extractUsername(token);
            return ResponseEntity.ok(Map.of("valid", true, "username", username));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
    }

    @PutMapping("/profile/{oldUsername}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String oldUsername,
            @RequestBody User updatedDetails) {
        
        Optional<User> userOpt = userRepository.findByUsername(oldUsername);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();

        // Check if the new username is already taken by someone else
        if (updatedDetails.getUsername() != null && !updatedDetails.getUsername().equals(oldUsername)) {
            if (userRepository.findByUsername(updatedDetails.getUsername()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username already taken"));
            }
            user.setUsername(updatedDetails.getUsername());
        }

        if (updatedDetails.getEmail() != null) {
            user.setEmail(updatedDetails.getEmail());
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "username", user.getUsername(),
                "email", user.getEmail() != null ? user.getEmail() : ""
        ));
    }
}
