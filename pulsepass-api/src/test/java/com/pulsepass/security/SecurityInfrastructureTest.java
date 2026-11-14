package com.pulsepass.security;

import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.service.AuthorizationService;
import com.pulsepass.service.EventService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.matchesPattern;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers =
                com.pulsepass.controller.EventController.class
)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        RequestIdFilter.class,
        RestAuthenticationEntryPoint.class,
        RestAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class SecurityInfrastructureTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    @MockitoBean(name = "authorizationService")
    private AuthorizationService authorizationService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void allowedOriginReceivesCorsHeader()
            throws Exception {
        when(eventService.findPublishedEvents())
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/events/published")
                                .header(
                                        HttpHeaders.ORIGIN,
                                        "http://localhost:3000"
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        header().string(
                                HttpHeaders
                                        .ACCESS_CONTROL_ALLOW_ORIGIN,
                                "http://localhost:3000"
                        )
                );
    }

    @Test
    void allowedPreflightRequestSucceeds()
            throws Exception {
        mockMvc.perform(
                        options("/api/events/published")
                                .header(
                                        HttpHeaders.ORIGIN,
                                        "http://localhost:3000"
                                )
                                .header(
                                        HttpHeaders
                                                .ACCESS_CONTROL_REQUEST_METHOD,
                                        "GET"
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        header().string(
                                HttpHeaders
                                        .ACCESS_CONTROL_ALLOW_ORIGIN,
                                "http://localhost:3000"
                        )
                )
                .andExpect(
                        header().string(
                                HttpHeaders
                                        .ACCESS_CONTROL_ALLOW_METHODS,
                                matchesPattern(
                                        ".*GET.*"
                                )
                        )
                );
    }

    @Test
    void disallowedOriginIsRejected()
            throws Exception {
        mockMvc.perform(
                        options("/api/events/published")
                                .header(
                                        HttpHeaders.ORIGIN,
                                        "https://malicious.example"
                                )
                                .header(
                                        HttpHeaders
                                                .ACCESS_CONTROL_REQUEST_METHOD,
                                        "GET"
                                )
                )
                .andExpect(status().isForbidden());
    }

    @Test
    void responseContainsRequestId()
            throws Exception {
        when(eventService.findPublishedEvents())
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/events/published")
                )
                .andExpect(status().isOk())
                .andExpect(
                        header().string(
                                RequestIdFilter
                                        .REQUEST_ID_HEADER,
                                matchesPattern(
                                        "^[0-9a-fA-F-]{36}$"
                                )
                        )
                );
    }
}