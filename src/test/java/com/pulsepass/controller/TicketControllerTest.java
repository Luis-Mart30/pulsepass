package com.pulsepass.controller;

import com.pulsepass.domain.TicketStatus;
import com.pulsepass.domain.TicketType;
import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.TicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
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

@WebMvcTest(TicketController.class)
@Import(GlobalExceptionHandler.class)
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketService ticketService;

    @Test
    void purchaseValidTicketShouldReturnCreated() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenReturn(ticketResponse(TicketStatus.PAID));

        String requestBody = """
                {
                  "userEmail": "andrea@example.com",
                  "eventCode": "CMF-2026",
                  "type": "VIP"
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.ticketCode").value("TKT-001"))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.userEmail")
                        .value("andrea@example.com"));

        verify(ticketService)
                .purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    void purchaseInvalidTicketShouldReturnBadRequest() throws Exception {
        String requestBody = """
                {
                  "userEmail": "invalid-email",
                  "eventCode": "",
                  "type": null
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message")
                        .value("Validation failed"))
                .andExpect(jsonPath("$.details.userEmail").exists())
                .andExpect(jsonPath("$.details.eventCode").exists())
                .andExpect(jsonPath("$.details.type").exists());

        verify(ticketService, never())
                .purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    void purchaseForMissingUserShouldReturnNotFound() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new ResourceNotFoundException(
                        "User not found: missing@example.com"
                ));

        String requestBody = """
                {
                  "userEmail": "missing@example.com",
                  "eventCode": "CMF-2026",
                  "type": "GENERAL"
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message")
                        .value("User not found: missing@example.com"));

        verify(ticketService)
                .purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    void purchaseAgainstBusinessRuleShouldReturnConflict()
            throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new BusinessRuleException(
                        "User does not meet minimum age"
                ));

        String requestBody = """
                {
                  "userEmail": "laura@example.com",
                  "eventCode": "CMF-2026",
                  "type": "GENERAL"
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message")
                        .value("User does not meet minimum age"));

        verify(ticketService)
                .purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    void findTicketShouldReturnOk() throws Exception {
        when(ticketService.findByCode("TKT-001"))
                .thenReturn(ticketResponse(TicketStatus.PAID));

        mockMvc.perform(get("/api/tickets/TKT-001"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.ticketCode").value("TKT-001"))
                .andExpect(jsonPath("$.status").value("PAID"));

        verify(ticketService).findByCode("TKT-001");
    }

    @Test
    void findTicketsByUserShouldReturnOk() throws Exception {
        when(ticketService.findByUserEmail("andrea@example.com"))
                .thenReturn(List.of(
                        ticketResponse(TicketStatus.PAID)
                ));

        mockMvc.perform(get("/api/tickets/by-user")
                        .param("email", "andrea@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$[0].ticketCode")
                        .value("TKT-001"))
                .andExpect(jsonPath("$[0].userEmail")
                        .value("andrea@example.com"));

        verify(ticketService)
                .findByUserEmail("andrea@example.com");
    }

    @Test
    void findPaidTicketsByEventShouldReturnOk() throws Exception {
        when(ticketService.findPaidTicketsByEvent("CMF-2026"))
                .thenReturn(List.of(
                        ticketResponse(TicketStatus.PAID)
                ));

        mockMvc.perform(get(
                        "/api/events/CMF-2026/tickets/paid"
                ))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$[0].eventCode")
                        .value("CMF-2026"))
                .andExpect(jsonPath("$[0].status").value("PAID"));

        verify(ticketService)
                .findPaidTicketsByEvent("CMF-2026");
    }

    @Test
    void cancelPaidTicketShouldReturnOk() throws Exception {
        when(ticketService.cancel("TKT-001"))
                .thenReturn(ticketResponse(TicketStatus.CANCELLED));

        mockMvc.perform(patch("/api/tickets/TKT-001/cancel"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.ticketCode").value("TKT-001"))
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(ticketService).cancel("TKT-001");
    }

    @Test
    void cancelInvalidTicketShouldReturnConflict() throws Exception {
        when(ticketService.cancel("TKT-001"))
                .thenThrow(new BusinessRuleException(
                        "Only PAID tickets can be cancelled"
                ));

        mockMvc.perform(patch("/api/tickets/TKT-001/cancel"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message")
                        .value("Only PAID tickets can be cancelled"));

        verify(ticketService).cancel("TKT-001");
    }

    @Test
    void usePaidTicketShouldReturnOk() throws Exception {
        when(ticketService.markAsUsed("TKT-001"))
                .thenReturn(ticketResponse(TicketStatus.USED));

        mockMvc.perform(patch("/api/tickets/TKT-001/use"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.ticketCode").value("TKT-001"))
                .andExpect(jsonPath("$.status").value("USED"));

        verify(ticketService).markAsUsed("TKT-001");
    }

    @Test
    void useInvalidTicketShouldReturnConflict() throws Exception {
        when(ticketService.markAsUsed("TKT-001"))
                .thenThrow(new BusinessRuleException(
                        "Only PAID tickets can be used"
                ));

        mockMvc.perform(patch("/api/tickets/TKT-001/use"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message")
                        .value("Only PAID tickets can be used"));

        verify(ticketService).markAsUsed("TKT-001");
    }

    private TicketResponse ticketResponse(TicketStatus status) {
        return new TicketResponse(
                1L,
                "TKT-001",
                TicketType.VIP,
                new BigDecimal("250000.00"),
                status,
                LocalDateTime.of(2026, 10, 9, 10, 0),
                "andrea@example.com",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );
    }
}