package com.pulsepass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET =
            "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    @Test
    void shouldGenerateTokenWithRequiredClaims() {
        JwtService jwtService = createJwtService();

        SecurityPrincipal principal =
                createPrincipal(true);

        String token = jwtService.generateToken(
                principal
        );

        Claims claims = Jwts.parser()
                .verifyWith(
                        Keys.hmacShaKeyFor(
                                Decoders.BASE64.decode(
                                        SECRET
                                )
                        )
                )
                .requireIssuer("pulsepass-api")
                .build()
                .parseSignedClaims(token)
                .getPayload();

        List<?> roles = claims.get(
                "roles",
                List.class
        );

        assertThat(claims.getSubject())
                .isEqualTo("1");

        assertThat(claims.getIssuer())
                .isEqualTo("pulsepass-api");

        assertThat(claims.getIssuedAt())
                .isNotNull();

        assertThat(claims.getExpiration())
                .isNotNull();

        assertThat(claims.getExpiration())
                .isAfter(claims.getIssuedAt());

        assertThat(claims.getId())
                .isNotBlank();

        assertThat(roles)
                .hasSize(1);

        assertThat(roles.get(0))
                .isEqualTo("USER");
    }

    @Test
    void shouldExtractUserIdAndValidateToken() {
        JwtService jwtService = createJwtService();

        SecurityPrincipal principal =
                createPrincipal(true);

        String token = jwtService.generateToken(
                principal
        );

        assertThat(
                jwtService.extractUserId(token)
        ).isEqualTo(1L);

        assertThat(
                jwtService.isTokenValid(
                        token,
                        principal
                )
        ).isTrue();

        assertThat(
                jwtService.getExpirationSeconds()
        ).isEqualTo(900L);
    }

    @Test
    void shouldRejectTokenForDifferentUser() {
        JwtService jwtService = createJwtService();

        String token = jwtService.generateToken(
                createPrincipal(true)
        );

        SecurityPrincipal anotherPrincipal =
                new SecurityPrincipal(
                        2L,
                        "carlos",
                        "carlos@example.com",
                        "$2a$10$anotherHash",
                        true,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_USER"
                                )
                        )
                );

        assertThat(
                jwtService.isTokenValid(
                        token,
                        anotherPrincipal
                )
        ).isFalse();
    }

    @Test
    void shouldRejectTokenWhenUserIsInactive() {
        JwtService jwtService = createJwtService();

        SecurityPrincipal activePrincipal =
                createPrincipal(true);

        String token = jwtService.generateToken(
                activePrincipal
        );

        SecurityPrincipal inactivePrincipal =
                createPrincipal(false);

        assertThat(
                jwtService.isTokenValid(
                        token,
                        inactivePrincipal
                )
        ).isFalse();
    }

    @Test
    void shouldRejectTamperedToken() {
        JwtService jwtService = createJwtService();

        String token = jwtService.generateToken(
                createPrincipal(true)
        );

        String[] parts = token.split("\\.");

        String originalPayload = parts[1];

        char replacement =
                originalPayload.charAt(0) == 'A'
                        ? 'B'
                        : 'A';

        String tamperedPayload =
                replacement
                        + originalPayload.substring(1);

        String tamperedToken =
                parts[0]
                        + "."
                        + tamperedPayload
                        + "."
                        + parts[2];

        assertThatThrownBy(
                () -> jwtService.extractUserId(
                        tamperedToken
                )
        ).isInstanceOf(JwtException.class);
    }

    @Test
    void shouldRejectExpiredToken()
            throws InterruptedException {
        JwtProperties properties =
                new JwtProperties(
                        "pulsepass-api",
                        Duration.ofMillis(1),
                        SECRET
                );

        JwtService jwtService =
                new JwtService(properties);

        String token = jwtService.generateToken(
                createPrincipal(true)
        );

        Thread.sleep(25);

        assertThatThrownBy(
                () -> jwtService.extractUserId(token)
        ).isInstanceOf(
                ExpiredJwtException.class
        );
    }

    @Test
    void shouldRejectTokenFromDifferentIssuer() {
        JwtService differentIssuerService =
                new JwtService(
                        new JwtProperties(
                                "pulsepass-other-api",
                                Duration.ofMinutes(15),
                                SECRET
                        )
                );

        String token =
                differentIssuerService.generateToken(
                        createPrincipal(true)
                );

        JwtService expectedIssuerService =
                createJwtService();

        assertThatThrownBy(
                () -> expectedIssuerService
                        .extractUserId(token)
        ).isInstanceOf(JwtException.class);
    }

    @Test
    void shouldRejectSecretShorterThanThirtyTwoBytes() {
        String shortSecret =
                "c2hvcnQtc2VjcmV0";

        assertThatThrownBy(
                () -> new JwtProperties(
                        "pulsepass-api",
                        Duration.ofMinutes(15),
                        shortSecret
                )
        )
                .isInstanceOf(
                        IllegalStateException.class
                )
                .hasMessageContaining(
                        "at least 32 decoded bytes"
                );
    }

    @Test
    void shouldRejectEmptyToken() {
        JwtService jwtService = createJwtService();

        assertThatThrownBy(
                () -> jwtService.extractUserId("")
        )
                .isInstanceOf(
                        MalformedJwtException.class
                )
                .hasMessageContaining(
                        "must not be empty"
                );
    }

    @Test
    void shouldRejectTokenSignedWithUnexpectedAlgorithm() {
        SecretKey hs384Key =
                Jwts.SIG.HS384.key().build();

        String hs384Secret =
                Encoders.BASE64.encode(
                        hs384Key.getEncoded()
                );

        JwtService jwtService =
                new JwtService(
                        new JwtProperties(
                                "pulsepass-api",
                                Duration.ofMinutes(15),
                                hs384Secret
                        )
                );

        Instant now = Instant.now();

        String token = Jwts.builder()
                .subject("1")
                .issuer("pulsepass-api")
                .issuedAt(Date.from(now))
                .expiration(
                        Date.from(
                                now.plusSeconds(900)
                        )
                )
                .id("test-token-id")
                .signWith(
                        hs384Key,
                        Jwts.SIG.HS384
                )
                .compact();

        assertThatThrownBy(
                () -> jwtService.extractUserId(token)
        )
                .isInstanceOf(
                        UnsupportedJwtException.class
                )
                .hasMessageContaining("HS256");
    }

    @Test
    void shouldRejectTokenWithoutExpiration() {
        JwtService jwtService = createJwtService();

        SecretKey key = createSigningKey();

        String token = Jwts.builder()
                .subject("1")
                .issuer("pulsepass-api")
                .issuedAt(new Date())
                .id("test-token-id")
                .signWith(
                        key,
                        Jwts.SIG.HS256
                )
                .compact();

        assertThatThrownBy(
                () -> jwtService.extractUserId(token)
        )
                .isInstanceOf(
                        MalformedJwtException.class
                )
                .hasMessageContaining("expiration");
    }

    @Test
    void shouldRejectTokenWithoutIssuedAt() {
        JwtService jwtService = createJwtService();

        SecretKey key = createSigningKey();

        String token = Jwts.builder()
                .subject("1")
                .issuer("pulsepass-api")
                .expiration(
                        Date.from(
                                Instant.now()
                                        .plusSeconds(900)
                        )
                )
                .id("test-token-id")
                .signWith(
                        key,
                        Jwts.SIG.HS256
                )
                .compact();

        assertThatThrownBy(
                () -> jwtService.extractUserId(token)
        )
                .isInstanceOf(
                        MalformedJwtException.class
                )
                .hasMessageContaining("issued-at");
    }

    @Test
    void shouldRejectTokenWithoutJwtId() {
        JwtService jwtService = createJwtService();

        SecretKey key = createSigningKey();

        Instant now = Instant.now();

        String token = Jwts.builder()
                .subject("1")
                .issuer("pulsepass-api")
                .issuedAt(Date.from(now))
                .expiration(
                        Date.from(
                                now.plusSeconds(900)
                        )
                )
                .signWith(
                        key,
                        Jwts.SIG.HS256
                )
                .compact();

        assertThatThrownBy(
                () -> jwtService.extractUserId(token)
        )
                .isInstanceOf(
                        MalformedJwtException.class
                )
                .hasMessageContaining("ID");
    }

    private JwtService createJwtService() {
        JwtProperties properties =
                new JwtProperties(
                        "pulsepass-api",
                        Duration.ofMinutes(15),
                        SECRET
                );

        return new JwtService(properties);
    }

    private SecretKey createSigningKey() {
        return Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(SECRET)
        );
    }

    private SecurityPrincipal createPrincipal(
            boolean active
    ) {
        return new SecurityPrincipal(
                1L,
                "andrea",
                "andrea@example.com",
                "$2a$10$exampleHash",
                active,
                List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_USER"
                        )
                )
        );
    }
}