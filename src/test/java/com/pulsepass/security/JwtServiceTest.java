package com.pulsepass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET =
            "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    @Test
    void shouldGenerateTokenWithRequiredClaims() {
        JwtProperties properties = new JwtProperties(
                "pulsepass-api",
                Duration.ofMinutes(15),
                SECRET
        );

        JwtService jwtService = new JwtService(properties);
        SecurityPrincipal principal = createPrincipal(true);

        String token = jwtService.generateToken(principal);

        Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(
                        Decoders.BASE64.decode(SECRET)
                ))
                .requireIssuer("pulsepass-api")
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Number userId = claims.get("uid", Number.class);
        List<?> roles = claims.get("roles", List.class);

        assertThat(claims.getSubject()).isEqualTo("andrea");
        assertThat(claims.getIssuer()).isEqualTo("pulsepass-api");
        assertThat(claims.getIssuedAt()).isNotNull();
        assertThat(claims.getExpiration()).isNotNull();
        assertThat(claims.getExpiration())
                .isAfter(claims.getIssuedAt());
        assertThat(claims.getId()).isNotBlank();
        assertThat(userId.longValue()).isEqualTo(1L);
        assertThat(roles).hasSize(1);
        assertThat(roles.get(0)).isEqualTo("USER");
    }

    @Test
    void shouldExtractIdentityAndValidateToken() {
        JwtProperties properties = new JwtProperties(
                "pulsepass-api",
                Duration.ofMinutes(15),
                SECRET
        );

        JwtService jwtService = new JwtService(properties);
        SecurityPrincipal principal = createPrincipal(true);

        String token = jwtService.generateToken(principal);

        assertThat(jwtService.extractUsername(token))
                .isEqualTo("andrea");

        assertThat(jwtService.extractUserId(token))
                .isEqualTo(1L);

        assertThat(jwtService.isTokenValid(token, principal))
                .isTrue();

        assertThat(jwtService.getExpirationSeconds())
                .isEqualTo(900L);
    }

    @Test
    void shouldRejectTamperedToken() {
        JwtProperties properties = new JwtProperties(
                "pulsepass-api",
                Duration.ofMinutes(15),
                SECRET
        );

        JwtService jwtService = new JwtService(properties);

        String token = jwtService.generateToken(
                createPrincipal(true)
        );

        String[] parts = token.split("\\.");

        String originalSignature = parts[2];

        char replacement = originalSignature.charAt(0) == 'A'
                ? 'B'
                : 'A';

        String tamperedSignature =
                replacement + originalSignature.substring(1);

        String tamperedToken =
                parts[0] + "." + parts[1] + "." + tamperedSignature;

        assertThatThrownBy(
                () -> jwtService.extractUsername(tamperedToken)
        ).isInstanceOf(JwtException.class);
    }

    @Test
    void shouldRejectExpiredToken() throws InterruptedException {
        JwtProperties properties = new JwtProperties(
                "pulsepass-api",
                Duration.ofMillis(1),
                SECRET
        );

        JwtService jwtService = new JwtService(properties);

        String token = jwtService.generateToken(
                createPrincipal(true)
        );

        Thread.sleep(25);

        assertThatThrownBy(
                () -> jwtService.extractUsername(token)
        ).isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    void shouldRejectSecretShorterThanThirtyTwoBytes() {
        String shortSecret = "c2hvcnQtc2VjcmV0";

        assertThatThrownBy(() -> new JwtProperties(
                "pulsepass-api",
                Duration.ofMinutes(15),
                shortSecret
        ))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining(
                        "at least 32 decoded bytes"
                );
    }

    private SecurityPrincipal createPrincipal(boolean active) {
        return new SecurityPrincipal(
                1L,
                "andrea",
                "andrea@example.com",
                "$2a$10$exampleHash",
                active,
                List.of(
                        new SimpleGrantedAuthority("ROLE_USER")
                )
        );
    }
}