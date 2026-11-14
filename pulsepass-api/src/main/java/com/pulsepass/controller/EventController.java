package com.pulsepass.controller;

import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.service.AuthorizationService;
import com.pulsepass.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final AuthorizationService authorizationService;

    public EventController(
            EventService eventService,
            AuthorizationService authorizationService
    ) {
        this.eventService = eventService;
        this.authorizationService = authorizationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> create(
            @Valid @RequestBody CreateEventRequest request
    ) {
        EventResponse response = eventService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{eventCode}")
    @PreAuthorize("""
            @authorizationService.canViewEvent(
                authentication,
                #eventCode
            )
            """)
    public ResponseEntity<EventResponse> findByCode(
            @PathVariable String eventCode
    ) {
        return ResponseEntity.ok(
                eventService.findByCode(eventCode)
        );
    }

    @GetMapping("/published")
    public ResponseEntity<List<EventSummaryResponse>>
    findPublishedEvents() {
        return ResponseEntity.ok(
                eventService.findPublishedEvents()
        );
    }

    @PatchMapping("/{eventCode}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> publish(
            @PathVariable String eventCode
    ) {
        return ResponseEntity.ok(
                eventService.publish(eventCode)
        );
    }

    @PostMapping("/{eventCode}/artists/{artistId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> addArtist(
            @PathVariable String eventCode,
            @PathVariable Long artistId
    ) {
        return ResponseEntity.ok(
                eventService.addArtist(eventCode, artistId)
        );
    }

    @GetMapping("/by-artist")
    public ResponseEntity<List<EventSummaryResponse>> findByArtist(
            @RequestParam String stageName,
            Authentication authentication
    ) {
        if (authorizationService.canViewNonPublishedEvents(
                authentication
        )) {
            return ResponseEntity.ok(
                    eventService.findByArtist(stageName)
            );
        }

        return ResponseEntity.ok(
                eventService.findPublishedByArtist(stageName)
        );
    }
}