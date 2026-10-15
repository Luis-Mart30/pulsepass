package com.pulsepass.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.util.Base64;

@ConfigurationProperties(prefix = "pulsepass.security.jwt")
public record JwtProperties(
        String issuer,
        Duration accessTokenTtl,
        String secretBase64
) {

    public JwtProperties {
        if (issuer == null || issuer.isBlank()) {
            throw new IllegalStateException(
                    "JWT issuer must be configured"
            );
        }

        if (accessTokenTtl == null
                || accessTokenTtl.isZero()
                || accessTokenTtl.isNegative()) {
            throw new IllegalStateException(
                    "JWT access token TTL must be positive"
            );
        }

        if (secretBase64 == null || secretBase64.isBlank()) {
            throw new IllegalStateException(
                    "PULSEPASS_JWT_SECRET_BASE64 must be configured"
            );
        }

        byte[] decodedSecret;

        try {
            decodedSecret = Base64.getDecoder()
                    .decode(secretBase64);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "JWT secret must be valid Base64",
                    exception
            );
        }

        if (decodedSecret.length < 32) {
            throw new IllegalStateException(
                    "JWT secret must contain at least 32 decoded bytes"
            );
        }
    }

    public long expirationSeconds() {
        return accessTokenTtl.toSeconds();
    }
}