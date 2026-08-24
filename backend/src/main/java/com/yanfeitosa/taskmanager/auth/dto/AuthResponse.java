package com.yanfeitosa.taskmanager.auth.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long userId,
        String userName
) {
}
