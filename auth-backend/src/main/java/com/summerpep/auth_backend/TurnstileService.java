package com.summerpep.auth_backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Service
public class TurnstileService {

    @Value("${turnstile.secret.key:1x0000000000000000000000000000000AA}")
    private String secretKey;

    private final String URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    private final RestTemplate restTemplate = new RestTemplate();

    public boolean verifyToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("secret", secretKey);
            map.add("response", token);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(URL, request, Map.class);
            Map<String, Object> body = response.getBody();

            return body != null && Boolean.TRUE.equals(body.get("success"));
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
