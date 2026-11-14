package com.pulsepass.security;

import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.service.AuthorizationService;
import com.pulsepass.service.EventService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers =
                com.pulsepass.controller.EventController.class
)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        RestAuthenticationEntryPoint.class,
        RestAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class EventSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private AuthorizationService authorizationService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void anonymousCanReadPublishedEvents()
            throws Exception {
        when(eventService.findPublishedEvents())
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/events/published")
                )
                .andExpect(status().isOk())
                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                );

        verify(eventService).findPublishedEvents();
    }

    @Test
    void anonymousCannotCreateEvent()
            throws Exception {
        mockMvc.perform(
                        post("/api/events")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(validEventRequest())
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
                                .value(
                                        "Authentication is required "
                                                + "to access this resource"
                                )
                );

        verify(
                eventService,
                never()
        ).create(any(CreateEventRequest.class));
    }

    @Test
    void userCannotCreateEvent()
            throws Exception {
        mockMvc.perform(
                        post("/api/events")
                                .with(
                                        user("andrea")
                                                .roles("USER")
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(validEventRequest())
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
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "You do not have permission "
                                                + "to access this resource"
                                )
                );

        verify(
                eventService,
                never()
        ).create(any(CreateEventRequest.class));
    }

    @Test
    void adminCanCreateEvent()
            throws Exception {
        when(
                eventService.create(
                        any(CreateEventRequest.class)
                )
        ).thenReturn(null);

        mockMvc.perform(
                        post("/api/events")
                                .with(
                                        user("admin")
                                                .roles("ADMIN")
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(validEventRequest())
                )
                .andExpect(status().isCreated());

        verify(eventService).create(
                any(CreateEventRequest.class)
        );
    }

    @Test
    void userCannotPublishEvent()
            throws Exception {
        mockMvc.perform(
                        patch(
                                "/api/events/CMF-2026/publish"
                        )
                                .with(
                                        user("andrea")
                                                .roles("USER")
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
                eventService,
                never()
        ).publish("CMF-2026");
    }

    @Test
    void adminCanPublishEvent()
            throws Exception {
        EventResponse response = null;

        when(eventService.publish("CMF-2026"))
                .thenReturn(response);

        mockMvc.perform(
                        patch(
                                "/api/events/CMF-2026/publish"
                        )
                                .with(
                                        user("admin")
                                                .roles("ADMIN")
                                )
                )
                .andExpect(status().isOk());

        verify(eventService).publish("CMF-2026");
    }

    private String validEventRequest() {
        return """
                {
                  "eventCode": "CMF-2026",
                  "name": "Caribbean Music Fest 2026",
                  "description": "Festival musical",
                  "category": "MUSIC",
                  "eventDate": "2026-12-20T19:00:00",
                  "minimumAge": 18,
                  "venueCode": "VEN-SMR-01"
                }
                """;
    }
}