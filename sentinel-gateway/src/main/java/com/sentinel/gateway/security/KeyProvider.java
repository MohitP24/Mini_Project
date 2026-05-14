package com.sentinel.gateway.security;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Component
@Slf4j
public class KeyProvider {

    @Value("${sentinel.jwt.public-key-path:}")
    private String publicKeyPath;

    @Value("${sentinel.jwt.public-key-b64:}")
    private String publicKeyB64;

    private RSAPublicKey rsaPublicKey;

    @PostConstruct
    public void init() {
        try {
            String keyContent = null;
            if (publicKeyB64 != null && !publicKeyB64.trim().isEmpty() && !publicKeyB64.startsWith("REPLACE_")) {
                keyContent = new String(Base64.getDecoder().decode(publicKeyB64));
            } else if (publicKeyPath != null && !publicKeyPath.trim().isEmpty() && Files.exists(Paths.get(publicKeyPath))) {
                keyContent = new String(Files.readAllBytes(Paths.get(publicKeyPath)));
            } else {
                log.warn("No valid public key found via path or b64 config. JWT verification will fail if used.");
                return;
            }

            keyContent = keyContent.replaceAll("-----BEGIN PUBLIC KEY-----", "")
                    .replaceAll("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s+", "");

            byte[] keyBytes = Base64.getDecoder().decode(keyContent);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            this.rsaPublicKey = (RSAPublicKey) kf.generatePublic(spec);
            log.info("Successfully loaded RSA Public Key");
        } catch (Exception e) {
            log.error("Failed to load RSA Public Key", e);
        }
    }

    public RSAPublicKey getPublicKey() {
        return this.rsaPublicKey;
    }
}
