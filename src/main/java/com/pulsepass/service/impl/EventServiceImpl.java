package com.pulsepass.service.impl;

import com.pulsepass.domain.Artist;
import com.pulsepass.domain.Event;
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
import com.pulsepass.service.EventService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ArtistRepository artistRepository;
    private final EventMapper eventMapper;

    public EventServiceImpl(
            EventRepository eventRepository,
            VenueRepository venueRepository,
            ArtistRepository artistRepository,
            EventMapper eventMapper
    ) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.artistRepository = artistRepository;
        this.eventMapper = eventMapper;
    }

    @Override
    @Transactional
    public EventResponse create(CreateEventRequest request) {
        validateUniqueEventCode(request.eventCode());

        Venue venue = findVenue(request.venueCode());

        validateActiveVenue(venue);
        validateFutureDate(request.eventDate());
        validateMinimumAge(request.minimumAge());

        Event event = new Event();
        event.setEventCode(request.eventCode());
        event.setName(request.name());
        event.setDescription(request.description());
        event.setCategory(request.category());
        event.setStatus(EventStatus.DRAFT);
        event.setEventDate(request.eventDate());
        event.setMinimumAge(request.minimumAge());
        event.setVenue(venue);

        Event savedEvent = eventRepository.save(event);

        return eventMapper.toResponse(savedEvent);
    }

    @Override
    public EventResponse findByCode(String eventCode) {
        return eventRepository.findByEventCode(eventCode)
                .map(eventMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Event not found: " + eventCode
                ));
    }

    @Override
    public List<EventSummaryResponse> findPublishedEvents() {
        return eventRepository
                .findByStatusOrderByEventDateAsc(
                        EventStatus.PUBLISHED
                )
                .stream()
                .map(eventMapper::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional
    public EventResponse publish(String eventCode) {
        Event event = findEvent(eventCode);

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new BusinessRuleException(
                    "Only DRAFT events can be published."
            );
        }

        validateFutureDate(event.getEventDate());
        validateActiveVenue(event.getVenue());

        event.setStatus(EventStatus.PUBLISHED);

        Event savedEvent = eventRepository.save(event);

        return eventMapper.toResponse(savedEvent);
    }

    @Override
    @Transactional
    public EventResponse addArtist(
            String eventCode,
            Long artistId
    ) {
        Event event = findEvent(eventCode);

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Artist not found: " + artistId
                ));

        if (event.getStatus() == EventStatus.CANCELLED
                || event.getStatus() == EventStatus.FINISHED) {
            throw new BusinessRuleException(
                    "Artists cannot be added to cancelled or finished events."
            );
        }

        if (event.getArtists().contains(artist)) {
            throw new DuplicateResourceException(
                    "Artist is already associated with the event."
            );
        }

        event.addArtist(artist);

        Event savedEvent = eventRepository.save(event);

        return eventMapper.toResponse(savedEvent);
    }

    @Override
    public List<EventSummaryResponse> findByArtist(
            String stageName
    ) {
        return eventRepository
                .findByArtistStageName(stageName)
                .stream()
                .map(eventMapper::toSummaryResponse)
                .toList();
    }

    private Event findEvent(String eventCode) {
        return eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Event not found: " + eventCode
                ));
    }

    private Venue findVenue(String venueCode) {
        return venueRepository.findByCode(venueCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Venue not found: " + venueCode
                ));
    }

    private void validateUniqueEventCode(String eventCode) {
        if (eventRepository.existsByEventCode(eventCode)) {
            throw new DuplicateResourceException(
                    "Event code already exists: " + eventCode
            );
        }
    }

    private void validateActiveVenue(Venue venue) {
        if (!venue.isActive()) {
            throw new BusinessRuleException(
                    "Venue must be active."
            );
        }
    }

    private void validateFutureDate(LocalDateTime eventDate) {
        if (eventDate == null
                || !eventDate.isAfter(LocalDateTime.now())) {
            throw new BusinessRuleException(
                    "Event date must be in the future."
            );
        }
    }

    private void validateMinimumAge(Integer minimumAge) {
        if (minimumAge == null || minimumAge < 0) {
            throw new BusinessRuleException(
                    "Minimum age cannot be negative."
            );
        }
    }
}