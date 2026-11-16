package com.pulsepass.security;

import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.service.AuthService;
import com.pulsepass.service.AuthorizationService;
import com.pulsepass.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers =
                com.pulsepass.controller.UserController.class
)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        RestAuthenticationEntryPoint.class,
        RestAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class UserSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private UserService userService;

    @MockitoBean(name = "authorizationService")
    private AuthorizationService authorizationService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void anonymousCannotFindUserByEmail()
            throws Exception {
        mockMvc.perform(
                        get("/api/users/by-email")
                                .param(
                                        "email",
                                        "andrea@example.com"
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
                userService,
                never()
        ).findByEmail("andrea@example.com");
    }

    @Test
    void userCannotFindAnotherUserByEmail()
            throws Exception {
        when(
                authorizationService
                        .isSelfOrAdminByEmail(
                                any(Authentication.class),
                                eq("carlos@example.com")
                        )
        ).thenReturn(false);

        mockMvc.perform(
                        get("/api/users/by-email")
                                .with(
                                        user("andrea")
                                                .roles("USER")
                                )
                                .param(
                                        "email",
                                        "carlos@example.com"
                                )
                )
                .andExpect(status().isForbidden())
                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                )
                .andExpect(
                        jsonPath("$.status").value(403)
                )
                .andExpect(
                        jsonPath("$.error")
                                .value("Forbidden")
                );

        verify(
                userService,
                never()
        ).findByEmail("carlos@example.com");
    }

    @Test
    void userCanFindOwnInformationByEmail()
            throws Exception {
        when(
                authorizationService
                        .isSelfOrAdminByEmail(
                                any(Authentication.class),
                                eq("andrea@example.com")
                        )
        ).thenReturn(true);

        UserResponse response = null;

        when(
                userService.findByEmail(
                        "andrea@example.com"
                )
        ).thenReturn(response);

        mockMvc.perform(
                        get("/api/users/by-email")
                                .with(
                                        user("andrea")
                                                .roles("USER")
                                )
                                .param(
                                        "email",
                                        "andrea@example.com"
                                )
                )
                .andExpect(status().isOk());

        verify(userService).findByEmail(
                "andrea@example.com"
        );
    }

    @Test
    void adminCanFindAnotherUserByUsername()
            throws Exception {
        when(
                authorizationService
                        .isSelfOrAdminByUsername(
                                any(Authentication.class),
                                eq("andrea")
                        )
        ).thenReturn(true);

        UserResponse response = null;

        when(
                userService.findByUsername("andrea")
        ).thenReturn(response);

        mockMvc.perform(
                        get("/api/users/by-username")
                                .with(
                                        user("admin")
                                                .roles("ADMIN")
                                )
                                .param(
                                        "username",
                                        "andrea"
                                )
                )
                .andExpect(status().isOk());

        verify(userService).findByUsername(
                "andrea"
        );
    }
}