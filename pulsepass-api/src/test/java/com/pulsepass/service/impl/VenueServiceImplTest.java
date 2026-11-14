package com.pulsepass.service.impl;

import com.pulsepass.domain.Venue;
import com.pulsepass.dto.response.VenueResponse;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.VenueMapper;
import com.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VenueServiceImplTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private VenueMapper venueMapper;

    @InjectMocks
    private VenueServiceImpl venueService;

    @Test
    void shouldFindVenueByCode() {
        Venue venue = createVenue();
        VenueResponse response = createResponse();

        when(venueRepository.findByCode("VEN-SMR-01"))
                .thenReturn(Optional.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(response);

        VenueResponse result =
                venueService.findByCode("VEN-SMR-01");

        assertThat(result).isEqualTo(response);
        verify(venueRepository).findByCode("VEN-SMR-01");
        verify(venueMapper).toResponse(venue);
    }

    @Test
    void shouldThrowWhenVenueDoesNotExist() {
        when(venueRepository.findByCode("UNKNOWN"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> venueService.findByCode("UNKNOWN")
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Venue not found: UNKNOWN");

        verify(venueMapper, never()).toResponse(
                org.mockito.ArgumentMatchers.any(Venue.class)
        );
    }

    @Test
    void shouldReturnOnlyActiveVenuesOrderedByName() {
        Venue venue = createVenue();
        VenueResponse response = createResponse();

        when(venueRepository.findByActiveTrueOrderByNameAsc())
                .thenReturn(List.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(response);

        List<VenueResponse> result =
                venueService.findActiveVenues();

        assertThat(result).containsExactly(response);
        verify(venueRepository)
                .findByActiveTrueOrderByNameAsc();
    }

    private Venue createVenue() {
        Venue venue = new Venue();
        venue.setCode("VEN-SMR-01");
        venue.setName("Marina Convention Center");
        venue.setCity("Santa Marta");
        venue.setAddress("Carrera 1");
        venue.setCapacity(3);
        venue.setActive(true);
        return venue;
    }

    private VenueResponse createResponse() {
        return new VenueResponse(
                null,
                "VEN-SMR-01",
                "Marina Convention Center",
                "Santa Marta",
                "Carrera 1",
                3,
                true
        );
    }
}