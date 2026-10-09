package com.pulsepass.controller;

import com.pulsepass.domain.EventCategory;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.EventService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
@Import(GlobalExceptionHandler.class)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    @Test
    void createValidEventShouldReturnCreated() throws Exception {
        when(eventService.create(any(CreateEventRequest.class)))
                .thenReturn(eventResponse(EventStatus.DRAFT));

        String requestBody = """
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

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.status").value("DRAFT"));

        verify(eventService).create(any(CreateEventRequest.class));
    }

    @Test
    void createInvalidEventShouldReturnBadRequest() throws Exception {
        String requestBody = """
                {
                  "eventCode": "",
                  "name": "",
                  "description": "Festival musical",
                  "category": null,
                  "eventDate": null,
                  "minimumAge": -1,
                  "venueCode": ""
                }
                """;

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message")
                        .value("Validation failed"))
                .andExpect(jsonPath("$.details.eventCode").exists())
                .andExpect(jsonPath("$.details.name").exists())
                .andExpect(jsonPath("$.details.category").exists())
                .andExpect(jsonPath("$.details.eventDate").exists())
                .andExpect(jsonPath("$.details.minimumAge").exists())
                .andExpect(jsonPath("$.details.venueCode").exists());

        verify(eventService, never())
                .create(any(CreateEventRequest.class));
    }

    @Test
    void findExistingEventShouldReturnOk() throws Exception {
        when(eventService.findByCode("CMF-2026"))
                .thenReturn(eventResponse(EventStatus.DRAFT));

        mockMvc.perform(get("/api/events/CMF-2026"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.name")
                        .value("Caribbean Music Fest 2026"));

        verify(eventService).findByCode("CMF-2026");
    }

    @Test
    void findMissingEventShouldReturnNotFound() throws Exception {
        when(eventService.findByCode("UNKNOWN"))
                .thenThrow(new ResourceNotFoundException(
                        "Event not found: UNKNOWN"
                ));

        mockMvc.perform(get("/api/events/UNKNOWN"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message")
                        .value("Event not found: UNKNOWN"));

        verify(eventService).findByCode("UNKNOWN");
    }

    @Test
    void findPublishedEventsShouldReturnOk() throws Exception {
        when(eventService.findPublishedEvents())
                .thenReturn(List.of(eventSummary()));

        mockMvc.perform(get("/api/events/published"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$[0].eventCode")
                        .value("CMF-2026"))
                .andExpect(jsonPath("$[0].status")
                        .value("PUBLISHED"));

        verify(eventService).findPublishedEvents();
    }

    @Test
    void publishValidEventShouldReturnOk() throws Exception {
        when(eventService.publish("CMF-2026"))
                .thenReturn(eventResponse(EventStatus.PUBLISHED));

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        verify(eventService).publish("CMF-2026");
    }

    @Test
    void publishInvalidEventShouldReturnConflict() throws Exception {
        when(eventService.publish("CMF-2026"))
                .thenThrow(new BusinessRuleException(
                        "Event cannot be published"
                ));

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message")
                        .value("Event cannot be published"));

        verify(eventService).publish("CMF-2026");
    }

    @Test
    void addArtistShouldReturnUpdatedEvent() throws Exception {
        when(eventService.addArtist("CMF-2026", 1L))
                .thenReturn(eventResponse(EventStatus.DRAFT));

        mockMvc.perform(post(
                        "/api/events/CMF-2026/artists/1"
                ))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"));

        verify(eventService).addArtist("CMF-2026", 1L);
    }

    @Test
    void findEventsByArtistShouldReturnOk() throws Exception {
        when(eventService.findByArtist("Solar Beat"))
                .thenReturn(List.of(eventSummary()));

        mockMvc.perform(get("/api/events/by-artist")
                        .param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$[0].eventCode")
                        .value("CMF-2026"));

        verify(eventService).findByArtist("Solar Beat");
    }

    private EventResponse eventResponse(EventStatus status) {
        return new EventResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival musical",
                EventCategory.MUSIC,
                status,
                LocalDateTime.of(2026, 12, 20, 19, 0),
                18,
                "VEN-SMR-01",
                "Marina Convention Center",
                List.of()
        );
    }

    private EventSummaryResponse eventSummary() {
        return new EventSummaryResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest 2026",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.of(2026, 12, 20, 19, 0),
                18,
                "VEN-SMR-01",
                "Marina Convention Center"
        );
    }
}