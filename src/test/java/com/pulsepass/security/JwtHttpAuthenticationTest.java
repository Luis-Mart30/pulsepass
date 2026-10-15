package com.pulsepass.security;

import com.pulsepass.controller.AuthController;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        RestAuthenticationEntryPoint.class,
        RestAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class JwtHttpAuthenticationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @Test
    void validBearerTokenAuthenticatesCurrentUser()
            throws Exception {
        SecurityPrincipal principal =
                new SecurityPrincipal(
                        1L,
                        "andrea",
                        "andrea@example.com",
                        "$2a$10$exampleHash",
                        true,
                        List.of(
                                () -> "ROLE_USER"
                        )
                );

        when(
                jwtService.extractUserId(
                        "valid-signed-token"
                )
        ).thenReturn(1L);

        when(
                userDetailsService.loadByUserId(1L)
        ).thenReturn(principal);

        when(
                jwtService.isTokenValid(
                        "valid-signed-token",
                        principal
                )
        ).thenReturn(true);

        mockMvc.perform(
                        get("/api/auth/me")
                                .header(
                                        "Authorization",
                                        "Bearer valid-signed-token"
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        content()
                                .contentTypeCompatibleWith(
                                        "application/json"
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
                                org.hamcrest.Matchers.not(
                                        org.hamcrest.Matchers
                                                .containsString(
                                                        "$2a$10$exampleHash"
                                                )
                                )
                        )
                );

        verify(jwtService).extractUserId(
                "valid-signed-token"
        );

        verify(userDetailsService)
                .loadByUserId(1L);

        verify(jwtService).isTokenValid(
                "valid-signed-token",
                principal
        );
    }
}