package com.sentinel.gateway.security;

import com.sentinel.common.model.JwtClaims;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class JwtValidator {

    private final KeyProvider keyProvider;

    @Value("${sentinel.jwt.issuer}")
    private String expectedIssuer;

    @Value("${sentinel.jwt.audience}")
    private String expectedAudience;

    public JwtValidator(KeyProvider keyProvider) {
        this.keyProvider = keyProvider;
    }

    public JwtClaims validateAndExtract(String token) {
        if (keyProvider.getPublicKey() == null) {
            throw new IllegalStateException("RSA Public Key is not configured");
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(keyProvider.getPublicKey())
                    .requireIssuer(expectedIssuer)
                    .requireAudience(expectedAudience)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);
            String email = claims.get("email", String.class);

            return JwtClaims.builder()
                    .subject(claims.getSubject())
                    .roles(roles)
                    .issuer(claims.getIssuer())
                    .email(email)
                    .build();
        } catch (Exception e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return null; // Invalid token
        }
    }
}
