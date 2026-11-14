package com.pulsepass.security;

import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.service.AuthorizationService;
import com.pulsepass.service.TicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
                com.pulsepass.controller.TicketController.class
)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        RestAuthenticationEntryPoint.class,
        RestAccessDeniedHandler.class,
        GlobalExceptionHandler.class
})
class TicketSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketService ticketService;

    @MockitoBean(name = "authorizationService")
    private AuthorizationService authorizationService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void anonymousCannotPurchaseTicket()
            throws Exception {
        mockMvc.perform(
                        post("/api/tickets")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(validPurchaseRequest())
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
                );

        verify(
                ticketService,
                never()
        ).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    void userCannotPurchaseForAnotherEmail()
            throws Exception {
        when(
                authorizationService.canPurchaseForEmail(
                        any(Authentication.class),
                        eq("carlos@example.com")
                )
        ).thenReturn(false);

        mockMvc.perform(
                        post("/api/tickets")
                                .with(
                                        user("andrea")
                                                .roles("USER")
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        purchaseRequest(
                                                "carlos@example.com"
                                        )
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
                ticketService,
                never()
        ).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    void userCanPurchaseForOwnEmail()
            throws Exception {
        when(
                authorizationService.canPurchaseForEmail(
                        any(Authentication.class),
                        eq("andrea@example.com")
                )
        ).thenReturn(true);

        TicketResponse response = null;

        when(
                ticketService.purchase(
                        any(PurchaseTicketRequest.class)
                )
        ).thenReturn(response);

        mockMvc.perform(
                        post("/api/tickets")
                                .with(
                                        user("andrea")
                                                .roles("USER")
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(validPurchaseRequest())
                )
                .andExpect(status().isCreated());

        verify(ticketService).purchase(
                any(PurchaseTicketRequest.class)
        );
    }

    @Test
    void userCannotReadAnotherUsersTicket()
            throws Exception {
        when(
                authorizationService.canReadTicket(
                        any(Authentication.class),
                        eq("TKT-CARLOS-001")
                )
        ).thenReturn(false);

        mockMvc.perform(
                        get(
                                "/api/tickets/TKT-CARLOS-001"
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
                );

        verify(
                ticketService,
                never()
        ).findByCode("TKT-CARLOS-001");
    }

    @Test
    void userCanCancelOwnTicket()
            throws Exception {
        when(
                authorizationService.canCancelTicket(
                        any(Authentication.class),
                        eq("TKT-ANDREA-001")
                )
        ).thenReturn(true);

        TicketResponse response = null;

        when(
                ticketService.cancel("TKT-ANDREA-001")
        ).thenReturn(response);

        mockMvc.perform(
                        patch(
                                "/api/tickets/"
                                        + "TKT-ANDREA-001/cancel"
                        )
                                .with(
                                        user("andrea")
                                                .roles("USER")
                                )
                )
                .andExpect(status().isOk());

        verify(ticketService).cancel(
                "TKT-ANDREA-001"
        );
    }

    @Test
    void userCannotMarkTicketAsUsed()
            throws Exception {
        mockMvc.perform(
                        patch(
                                "/api/tickets/"
                                        + "TKT-ANDREA-001/use"
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
                );

        verify(
                ticketService,
                never()
        ).markAsUsed("TKT-ANDREA-001");
    }

    @Test
    void staffCanMarkTicketAsUsed()
            throws Exception {
        TicketResponse response = null;

        when(
                ticketService.markAsUsed(
                        "TKT-ANDREA-001"
                )
        ).thenReturn(response);

        mockMvc.perform(
                        patch(
                                "/api/tickets/"
                                        + "TKT-ANDREA-001/use"
                        )
                                .with(
                                        user("employee")
                                                .roles("STAFF")
                                )
                )
                .andExpect(status().isOk());

        verify(ticketService).markAsUsed(
                "TKT-ANDREA-001"
        );
    }

    private String validPurchaseRequest() {
        return purchaseRequest(
                "andrea@example.com"
        );
    }

    private String purchaseRequest(
            String email
    ) {
        return """
                {
                  "userEmail": "%s",
                  "eventCode": "CMF-2026",
                  "type": "GENERAL"
                }
                """.formatted(email);
    }
}