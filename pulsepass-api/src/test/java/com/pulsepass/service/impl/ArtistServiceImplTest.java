package com.pulsepass.service.impl;

import com.pulsepass.domain.Artist;
import com.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.ArtistMapper;
import com.pulsepass.repository.ArtistRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArtistServiceImplTest {

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private ArtistMapper artistMapper;

    @InjectMocks
    private ArtistServiceImpl artistService;

    @Test
    void shouldFindArtistById() {
        Artist artist = createArtist();
        ArtistResponse response = createResponse();

        when(artistRepository.findById(1L))
                .thenReturn(Optional.of(artist));
        when(artistMapper.toResponse(artist))
                .thenReturn(response);

        ArtistResponse result = artistService.findById(1L);

        assertThat(result).isEqualTo(response);
        verify(artistRepository).findById(1L);
        verify(artistMapper).toResponse(artist);
    }

    @Test
    void shouldThrowWhenArtistIdDoesNotExist() {
        when(artistRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> artistService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Artist not found: 99");

        verify(artistMapper, never()).toResponse(any(Artist.class));
    }

    @Test
    void shouldFindArtistByStageNameIgnoringCase() {
        Artist artist = createArtist();
        ArtistResponse response = createResponse();

        when(artistRepository.findByStageNameIgnoreCase(
                "solar beat"
        )).thenReturn(Optional.of(artist));
        when(artistMapper.toResponse(artist))
                .thenReturn(response);

        ArtistResponse result =
                artistService.findByStageName("solar beat");

        assertThat(result).isEqualTo(response);
        verify(artistRepository)
                .findByStageNameIgnoreCase("solar beat");
    }

    @Test
    void shouldReturnOnlyActiveArtistsOrderedByStageName() {
        Artist artist = createArtist();
        ArtistResponse response = createResponse();

        when(artistRepository
                .findByActiveTrueOrderByStageNameAsc())
                .thenReturn(List.of(artist));
        when(artistMapper.toResponse(artist))
                .thenReturn(response);

        List<ArtistResponse> result =
                artistService.findActiveArtists();

        assertThat(result).containsExactly(response);
        verify(artistRepository)
                .findByActiveTrueOrderByStageNameAsc();
    }

    private Artist createArtist() {
        Artist artist = new Artist();
        artist.setStageName("Solar Beat");
        artist.setCountry("Colombia");
        artist.setGenre("Electronic");
        artist.setActive(true);
        return artist;
    }

    private ArtistResponse createResponse() {
        return new ArtistResponse(
                null,
                "Solar Beat",
                "Colombia",
                "Electronic",
                true
        );
    }
}