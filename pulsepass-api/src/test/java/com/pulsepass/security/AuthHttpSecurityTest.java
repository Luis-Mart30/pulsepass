package com.pulsepass.security;

import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.service.AuthService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers =
                com.pulsepass.controller.AuthController.class
)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        RestAuthenticationEntryPoint.class,
        RestAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class AuthHttpSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void anonymousCanLoginWithCorrectCredentials()
            throws Exception {
        AuthResponse response = new AuthResponse(
                "signed-jwt-token",
                "Bearer",
                900L
        );

        when(
                authService.login(
                        any(LoginRequest.class)
                )
        ).thenReturn(response);

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(validLoginRequest())
                )
                .andExpect(status().isOk())
                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                )
                .andExpect(
                        jsonPath("$.accessToken")
                                .value("signed-jwt-token")
                )
                .andExpect(
                        jsonPath("$.tokenType")
                                .value("Bearer")
                )
                .andExpect(
                        jsonPath("$.expiresIn")
                                .value(900)
                );

        verify(authService).login(
                any(LoginRequest.class)
        );
    }

    @Test
    void incorrectPasswordReturnsGenericUnauthorized()
            throws Exception {
        when(
                authService.login(
                        any(LoginRequest.class)
                )
        ).thenThrow(
                new BadCredentialsException(
                        "Invalid credentials."
                )
        );

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "identifier": "andrea",
                                          "password": "ClaveIncorrecta"
                                        }
                                        """
                                )
                )
                .andExpect(status().isUnauthorized())
                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                )
                .andExpect(
                        jsonPath("$.status").value(401)
                )
                .andExpect(
                        jsonPath("$.error")
                                .value("Unauthorized")
                )
                .andExpect(
                        jsonPath("$.message")
                                .value("Invalid credentials.")
                )
                .andExpect(
                        content().string(
                                not(
                                        containsString(
                                                "ClaveIncorrecta"
                                        )
                                )
                        )
                )
                .andExpect(
                        content().string(
                                not(
                                        containsString(
                                                "passwordHash"
                                        )
                                )
                        )
                );
    }

    @Test
    void anonymousCannotAccessAuthenticatedProfile()
            throws Exception {
        mockMvc.perform(
                        get("/api/auth/me")
                )
                .andExpect(status().isUnauthorized())
                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                )
                .andExpect(
                        jsonPath("$.status").value(401)
                )
                .andExpect(
                        jsonPath("$.error")
                                .value("Unauthorized")
                );
    }

    @Test
    void authenticatedPrincipalReturnsProfile()
            throws Exception {
        SecurityPrincipal principal =
                createPrincipal(true);

        UsernamePasswordAuthenticationToken
                authenticatedUser =
                new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.getAuthorities()
                );

        mockMvc.perform(
                        get("/api/auth/me")
                                .with(
                                        authentication(
                                                authenticatedUser
                                        )
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                )
                .andExpect(
                        jsonPath("$.id").value(1)
                )
                .andExpect(
                        jsonPath("$.username")
                                .value("andrea")
                )
                .andExpect(
                        jsonPath("$.email")
                                .value(
                                        "andrea@example.com"
                                )
                )
                .andExpect(
                        jsonPath("$.roles[0]")
                                .value("USER")
                )
                .andExpect(
                        content().string(
                                not(
                                        containsString(
                                                "$2a$10$exampleHash"
                                        )
                                )
                        )
                );
    }

    @Test
    void tamperedBearerTokenReturnsUnauthorized()
            throws Exception {
        when(
                jwtService.extractUserId(
                        "tampered-token"
                )
        ).thenThrow(
                new MalformedJwtException(
                        "Invalid JWT signature"
                )
        );

        mockMvc.perform(
                        get("/api/auth/me")
                                .header(
                                        "Authorization",
                                        "Bearer tampered-token"
                                )
                )
                .andExpect(status().isUnauthorized())
                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                )
                .andExpect(
                        jsonPath("$.status").value(401)
                )
                .andExpect(
                        jsonPath("$.error")
                                .value("Unauthorized")
                );

        verify(
                customUserDetailsService,
                never()
        ).loadByUserId(1L);
    }

    @Test
    void expiredBearerTokenReturnsUnauthorized()
            throws Exception {
        when(
                jwtService.extractUserId(
                        "expired-token"
                )
        ).thenThrow(
                new ExpiredJwtException(
                        null,
                        null,
                        "JWT expired"
                )
        );

        mockMvc.perform(
                        get("/api/auth/me")
                                .header(
                                        "Authorization",
                                        "Bearer expired-token"
                                )
                )
                .andExpect(status().isUnauthorized())
                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                )
                .andExpect(
                        jsonPath("$.status").value(401)
                )
                .andExpect(
                        jsonPath("$.error")
                                .value("Unauthorized")
                );
    }

    @Test
    void inactiveUserTokenReturnsUnauthorized()
            throws Exception {
        SecurityPrincipal inactivePrincipal =
                createPrincipal(false);

        when(
                jwtService.extractUserId(
                        "inactive-user-token"
                )
        ).thenReturn(1L);

        when(
                customUserDetailsService.loadByUserId(1L)
        ).thenReturn(inactivePrincipal);

        when(
                jwtService.isTokenValid(
                        "inactive-user-token",
                        inactivePrincipal
                )
        ).thenReturn(false);

        mockMvc.perform(
                        get("/api/auth/me")
                                .header(
                                        "Authorization",
                                        "Bearer inactive-user-token"
                                )
                )
                .andExpect(status().isUnauthorized())
                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                )
                .andExpect(
                        jsonPath("$.status").value(401)
                )
                .andExpect(
                        jsonPath("$.error")
                                .value("Unauthorized")
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

    private String validLoginRequest() {
        return """
                {
                  "identifier": "andrea",
                  "password": "UnaClaveSegura2026!"
                }
                """;
    }
}