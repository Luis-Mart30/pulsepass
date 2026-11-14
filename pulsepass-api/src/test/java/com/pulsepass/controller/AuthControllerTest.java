package com.pulsepass.controller;

import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.dto.response.AuthenticatedUserResponse;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.security.SecurityPrincipal;
import com.pulsepass.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    private AuthController authController;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        authController = new AuthController(authService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(
                        new GlobalExceptionHandler()
                )
                .build();
    }

    @Test
    void shouldLoginAndReturnBearerToken() throws Exception {
        AuthResponse response = new AuthResponse(
                "jwt-token",
                "Bearer",
                900L
        );

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(response);

        String requestBody = """
                {
                  "identifier": "andrea",
                  "password": "UnaClaveSegura2026!"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.accessToken")
                        .value("jwt-token"))
                .andExpect(jsonPath("$.tokenType")
                        .value("Bearer"))
                .andExpect(jsonPath("$.expiresIn")
                        .value(900));

        verify(authService).login(
                any(LoginRequest.class)
        );
    }

    @Test
    void shouldReturnBadRequestWhenLoginIsInvalid()
            throws Exception {
        String requestBody = """
                {
                  "identifier": "",
                  "password": ""
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error")
                        .value("Bad Request"))
                .andExpect(jsonPath("$.message")
                        .value("Validation failed"))
                .andExpect(jsonPath("$.details.identifier")
                        .value("Identifier is required"))
                .andExpect(jsonPath("$.details.password")
                        .value("Password is required"));
    }

    @Test
    void shouldReturnUnauthorizedForInvalidCredentials()
            throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException(
                        "Invalid credentials."
                ));

        String requestBody = """
                {
                  "identifier": "andrea",
                  "password": "ClaveIncorrecta"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error")
                        .value("Unauthorized"))
                .andExpect(jsonPath("$.message")
                        .value("Invalid credentials."))
                .andExpect(jsonPath("$.details").isEmpty());
    }

    @Test
    void shouldReturnAuthenticatedUserWithoutSecrets() {
        SecurityPrincipal principal = new SecurityPrincipal(
                1L,
                "andrea",
                "andrea@example.com",
                "$2a$10$encoded-password",
                true,
                List.of(
                        new SimpleGrantedAuthority("ROLE_USER")
                )
        );

        AuthenticatedUserResponse response =
                authController.me(principal).getBody();

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.username()).isEqualTo("andrea");
        assertThat(response.email())
                .isEqualTo("andrea@example.com");
        assertThat(response.roles())
                .containsExactly("USER");
        assertThat(response.toString())
                .doesNotContain("$2a$10$encoded-password");
    }
}