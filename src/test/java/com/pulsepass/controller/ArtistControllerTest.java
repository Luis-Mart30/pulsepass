package com.pulsepass.controller;

import com.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.ArtistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ArtistController.class)
@Import(GlobalExceptionHandler.class)
class ArtistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ArtistService artistService;

    @Test
    void shouldReturnArtistWhenIdExists() throws Exception {
        ArtistResponse response = new ArtistResponse(
                1L,
                "Solar Beat",
                "Colombia",
                "Electronic",
                true
        );

        when(artistService.findById(1L))
                .thenReturn(response);

        mockMvc.perform(get("/api/artists/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.stageName").value("Solar Beat"))
                .andExpect(jsonPath("$.country").value("Colombia"))
                .andExpect(jsonPath("$.genre").value("Electronic"))
                .andExpect(jsonPath("$.active").value(true));

        verify(artistService).findById(1L);
    }

    @Test
    void shouldReturnNotFoundWhenArtistDoesNotExist() throws Exception {
        when(artistService.findById(999L))
                .thenThrow(new ResourceNotFoundException(
                        "Artist not found: 999"
                ));

        mockMvc.perform(get("/api/artists/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message")
                        .value("Artist not found: 999"));

        verify(artistService).findById(999L);
    }

    @Test
    void shouldReturnArtistByStageName() throws Exception {
        ArtistResponse response = new ArtistResponse(
                1L,
                "Solar Beat",
                "Colombia",
                "Electronic",
                true
        );

        when(artistService.findByStageName("Solar Beat"))
                .thenReturn(response);

        mockMvc.perform(get("/api/artists/by-stage-name")
                        .param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.stageName").value("Solar Beat"))
                .andExpect(jsonPath("$.active").value(true));

        verify(artistService).findByStageName("Solar Beat");
    }

    @Test
    void shouldReturnActiveArtists() throws Exception {
        ArtistResponse response = new ArtistResponse(
                1L,
                "Solar Beat",
                "Colombia",
                "Electronic",
                true
        );

        when(artistService.findActiveArtists())
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/artists/active"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].stageName")
                        .value("Solar Beat"))
                .andExpect(jsonPath("$[0].active").value(true));

        verify(artistService).findActiveArtists();
    }
}