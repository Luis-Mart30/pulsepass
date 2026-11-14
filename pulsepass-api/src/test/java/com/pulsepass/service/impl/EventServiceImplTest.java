package com.pulsepass.service.impl;

import com.pulsepass.domain.Artist;
import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventCategory;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.Venue;
import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.EventMapper;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    private static final String EVENT_CODE = "CMF-2026";
    private static final String VENUE_CODE = "VEN-SMR-01";

    @Mock
    private EventRepository eventRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private EventServiceImpl eventService;

    @Test
    void shouldReturnEventWhenCodeExists() {
        Event event = createDraftEvent();
        EventResponse response = createEventResponse();

        when(eventRepository.findByEventCode(eq(EVENT_CODE)))
                .thenReturn(Optional.of(event));
        when(eventMapper.toResponse(event)).thenReturn(response);

        EventResponse result =
                eventService.findByCode(EVENT_CODE);

        assertThat(result).isEqualTo(response);
        verify(eventRepository).findByEventCode(EVENT_CODE);
        verify(eventMapper).toResponse(event);
    }

    @Test
    void shouldThrowWhenEventDoesNotExist() {
        when(eventRepository.findByEventCode(EVENT_CODE))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> eventService.findByCode(EVENT_CODE)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Event not found: " + EVENT_CODE);

        verify(eventMapper, never())
                .toResponse(any(Event.class));
    }

    @Test
    void shouldCreateValidEventAsDraft() {
        Venue venue = createVenue(true);
        CreateEventRequest request = createRequest(
                LocalDateTime.now().plusDays(10),
                18
        );
        EventResponse response = createEventResponse();

        when(eventRepository.existsByEventCode(EVENT_CODE))
                .thenReturn(false);
        when(venueRepository.findByCode(VENUE_CODE))
                .thenReturn(Optional.of(venue));
        when(eventRepository.save(any(Event.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(eventMapper.toResponse(any(Event.class)))
                .thenReturn(response);

        EventResponse result = eventService.create(request);

        assertThat(result).isEqualTo(response);

        verify(eventRepository).save(
                org.mockito.ArgumentMatchers.argThat(event ->
                        event.getStatus() == EventStatus.DRAFT
                                && event.getEventCode()
                                .equals(EVENT_CODE)
                                && event.getVenue() == venue
                )
        );
    }

    @Test
    void shouldRejectDuplicatedEventCode() {
        CreateEventRequest request = createRequest(
                LocalDateTime.now().plusDays(10),
                18
        );

        when(eventRepository.existsByEventCode(EVENT_CODE))
                .thenReturn(true);

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(venueRepository, never())
                .findByCode(anyString());
        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldRejectCreationWhenVenueDoesNotExist() {
        CreateEventRequest request = createRequest(
                LocalDateTime.now().plusDays(10),
                18
        );

        when(eventRepository.existsByEventCode(EVENT_CODE))
                .thenReturn(false);
        when(venueRepository.findByCode(VENUE_CODE))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Venue not found: " + VENUE_CODE);

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldRejectCreationWhenVenueIsInactive() {
        Venue venue = createVenue(false);
        CreateEventRequest request = createRequest(
                LocalDateTime.now().plusDays(10),
                18
        );

        when(eventRepository.existsByEventCode(EVENT_CODE))
                .thenReturn(false);
        when(venueRepository.findByCode(VENUE_CODE))
                .thenReturn(Optional.of(venue));

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Venue must be active.");

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldRejectCreationWithPastDate() {
        Venue venue = createVenue(true);
        CreateEventRequest request = createRequest(
                LocalDateTime.now().minusDays(1),
                18
        );

        when(eventRepository.existsByEventCode(EVENT_CODE))
                .thenReturn(false);
        when(venueRepository.findByCode(VENUE_CODE))
                .thenReturn(Optional.of(venue));

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Event date must be in the future.");

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldRejectCreationWithNegativeMinimumAge() {
        Venue venue = createVenue(true);
        CreateEventRequest request = createRequest(
                LocalDateTime.now().plusDays(10),
                -1
        );

        when(eventRepository.existsByEventCode(EVENT_CODE))
                .thenReturn(false);
        when(venueRepository.findByCode(VENUE_CODE))
                .thenReturn(Optional.of(venue));

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Minimum age cannot be negative.");

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldPublishValidDraftEvent() {
        Event event = createDraftEvent();
        EventResponse response = createEventResponse();

        when(eventRepository.findByEventCode(EVENT_CODE))
                .thenReturn(Optional.of(event));
        when(eventRepository.save(event)).thenReturn(event);
        when(eventMapper.toResponse(event)).thenReturn(response);

        EventResponse result =
                eventService.publish(EVENT_CODE);

        assertThat(result).isEqualTo(response);
        assertThat(event.getStatus())
                .isEqualTo(EventStatus.PUBLISHED);

        verify(eventRepository).save(event);
    }

    @Test
    void shouldRejectPublishingCancelledEvent() {
        Event event = createDraftEvent();
        event.setStatus(EventStatus.CANCELLED);

        when(eventRepository.findByEventCode(EVENT_CODE))
                .thenReturn(Optional.of(event));

        assertThatThrownBy(
                () -> eventService.publish(EVENT_CODE)
        )
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Only DRAFT events can be published.");

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldRejectPublishingEventWithPastDate() {
        Event event = createDraftEvent();
        event.setEventDate(LocalDateTime.now().minusDays(1));

        when(eventRepository.findByEventCode(EVENT_CODE))
                .thenReturn(Optional.of(event));

        assertThatThrownBy(
                () -> eventService.publish(EVENT_CODE)
        )
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Event date must be in the future.");

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldRejectPublishingEventWithInactiveVenue() {
        Event event = createDraftEvent();
        event.getVenue().setActive(false);

        when(eventRepository.findByEventCode(EVENT_CODE))
                .thenReturn(Optional.of(event));

        assertThatThrownBy(
                () -> eventService.publish(EVENT_CODE)
        )
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Venue must be active.");

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldAddArtistToEvent() {
        Event event = createDraftEvent();
        Artist artist = createArtist();
        EventResponse response = createEventResponse();

        when(eventRepository.findByEventCode(EVENT_CODE))
                .thenReturn(Optional.of(event));
        when(artistRepository.findById(1L))
                .thenReturn(Optional.of(artist));
        when(eventRepository.save(event)).thenReturn(event);
        when(eventMapper.toResponse(event)).thenReturn(response);

        EventResponse result =
                eventService.addArtist(EVENT_CODE, 1L);

        assertThat(result).isEqualTo(response);
        assertThat(event.getArtists()).containsExactly(artist);
        assertThat(artist.getEvents()).contains(event);

        verify(eventRepository).save(event);
    }

    @Test
    void shouldRejectAddingArtistWhenArtistDoesNotExist() {
        Event event = createDraftEvent();

        when(eventRepository.findByEventCode(EVENT_CODE))
                .thenReturn(Optional.of(event));
        when(artistRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> eventService.addArtist(EVENT_CODE, 99L)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Artist not found: 99");

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldRejectDuplicatedArtistAssociation() {
        Event event = createDraftEvent();
        Artist artist = createArtist();
        event.addArtist(artist);

        when(eventRepository.findByEventCode(EVENT_CODE))
                .thenReturn(Optional.of(event));
        when(artistRepository.findById(1L))
                .thenReturn(Optional.of(artist));

        assertThatThrownBy(
                () -> eventService.addArtist(EVENT_CODE, 1L)
        )
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage(
                        "Artist is already associated with the event."
                );

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldRejectAddingArtistToCancelledEvent() {
        Event event = createDraftEvent();
        event.setStatus(EventStatus.CANCELLED);
        Artist artist = createArtist();

        when(eventRepository.findByEventCode(EVENT_CODE))
                .thenReturn(Optional.of(event));
        when(artistRepository.findById(1L))
                .thenReturn(Optional.of(artist));

        assertThatThrownBy(
                () -> eventService.addArtist(EVENT_CODE, 1L)
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldReturnPublishedEvents() {
        Event event = createDraftEvent();
        event.setStatus(EventStatus.PUBLISHED);
        EventSummaryResponse summary = createSummary();

        when(eventRepository.findByStatusOrderByEventDateAsc(
                EventStatus.PUBLISHED
        )).thenReturn(List.of(event));
        when(eventMapper.toSummaryResponse(event))
                .thenReturn(summary);

        List<EventSummaryResponse> result =
                eventService.findPublishedEvents();

        assertThat(result).containsExactly(summary);
    }

    @Test
    void shouldReturnEventsByArtist() {
        Event event = createDraftEvent();
        EventSummaryResponse summary = createSummary();

        when(eventRepository.findByArtistStageName("Solar Beat"))
                .thenReturn(List.of(event));
        when(eventMapper.toSummaryResponse(event))
                .thenReturn(summary);

        List<EventSummaryResponse> result =
                eventService.findByArtist("Solar Beat");

        assertThat(result).containsExactly(summary);
        verify(eventRepository)
                .findByArtistStageName("Solar Beat");
    }

    private CreateEventRequest createRequest(
            LocalDateTime eventDate,
            Integer minimumAge
    ) {
        return new CreateEventRequest(
                EVENT_CODE,
                "Caribbean Music Fest 2026",
                "Festival musical del Caribe",
                EventCategory.MUSIC,
                eventDate,
                minimumAge,
                VENUE_CODE
        );
    }

    private Venue createVenue(boolean active) {
        Venue venue = new Venue();
        venue.setCode(VENUE_CODE);
        venue.setName("Marina Convention Center");
        venue.setCity("Santa Marta");
        venue.setAddress("Carrera 1");
        venue.setCapacity(3);
        venue.setActive(active);
        return venue;
    }

    private Event createDraftEvent() {
        Event event = new Event();
        event.setEventCode(EVENT_CODE);
        event.setName("Caribbean Music Fest 2026");
        event.setDescription("Festival musical del Caribe");
        event.setCategory(EventCategory.MUSIC);
        event.setStatus(EventStatus.DRAFT);
        event.setEventDate(LocalDateTime.now().plusDays(10));
        event.setMinimumAge(18);
        event.setVenue(createVenue(true));
        return event;
    }

    private Artist createArtist() {
        Artist artist = new Artist();
        artist.setStageName("Solar Beat");
        artist.setCountry("Colombia");
        artist.setGenre("Electronic");
        artist.setActive(true);
        return artist;
    }

    private EventResponse createEventResponse() {
        return new EventResponse(
                null,
                EVENT_CODE,
                "Caribbean Music Fest 2026",
                "Festival musical del Caribe",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(10),
                18,
                VENUE_CODE,
                "Marina Convention Center",
                List.of()
        );
    }

    private EventSummaryResponse createSummary() {
        return new EventSummaryResponse(
                null,
                EVENT_CODE,
                "Caribbean Music Fest 2026",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                18,
                VENUE_CODE,
                "Marina Convention Center"
        );
    }
}