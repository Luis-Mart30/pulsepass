package com.pulsepass.service;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.User;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.security.SecurityPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private EventRepository eventRepository;

    private AuthorizationService authorizationService;

    @BeforeEach
    void setUp() {
        authorizationService = new AuthorizationService(
                userRepository,
                ticketRepository,
                eventRepository
        );
    }

    @Test
    void shouldAllowUserToFindOwnAccountByEmail() {
        User user = userWithId(1L);

        when(userRepository.findByEmailIgnoreCase(
                "andrea@example.com"
        )).thenReturn(Optional.of(user));

        Authentication authentication =
                authentication(1L, "USER");

        boolean allowed =
                authorizationService.isSelfOrAdminByEmail(
                        authentication,
                        "andrea@example.com"
                );

        assertThat(allowed).isTrue();
    }

    @Test
    void shouldRejectUserWhenEmailBelongsToAnotherUser() {
        User otherUser = userWithId(2L);

        when(userRepository.findByEmailIgnoreCase(
                "carlos@example.com"
        )).thenReturn(Optional.of(otherUser));

        Authentication authentication =
                authentication(1L, "USER");

        boolean allowed =
                authorizationService.isSelfOrAdminByEmail(
                        authentication,
                        "carlos@example.com"
                );

        assertThat(allowed).isFalse();
    }

    @Test
    void shouldAllowAdminToFindAnotherUserByUsername() {
        Authentication authentication =
                authentication(10L, "ADMIN");

        boolean allowed =
                authorizationService.isSelfOrAdminByUsername(
                        authentication,
                        "andrea"
                );

        assertThat(allowed).isTrue();
    }

    @Test
    void shouldAllowUserToPurchaseForOwnPersistedIdentity() {
        User user = userWithId(1L);

        when(userRepository.findByEmailIgnoreCase(
                "andrea@example.com"
        )).thenReturn(Optional.of(user));

        Authentication authentication =
                authentication(1L, "USER");

        boolean allowed =
                authorizationService.canPurchaseForEmail(
                        authentication,
                        "andrea@example.com"
                );

        assertThat(allowed).isTrue();
    }

    @Test
    void shouldRejectPurchaseForAnotherUserEmail() {
        User otherUser = userWithId(2L);

        when(userRepository.findByEmailIgnoreCase(
                "carlos@example.com"
        )).thenReturn(Optional.of(otherUser));

        Authentication authentication =
                authentication(1L, "USER");

        boolean allowed =
                authorizationService.canPurchaseForEmail(
                        authentication,
                        "carlos@example.com"
                );

        assertThat(allowed).isFalse();
    }

    @Test
    void shouldAllowOwnerToReadTicket() {
        Ticket ticket = ticketOwnedBy(1L);

        when(ticketRepository.findByTicketCode("TCK-001"))
                .thenReturn(Optional.of(ticket));

        Authentication authentication =
                authentication(1L, "USER");

        boolean allowed =
                authorizationService.canReadTicket(
                        authentication,
                        "TCK-001"
                );

        assertThat(allowed).isTrue();
    }

    @Test
    void shouldRejectAnotherUserReadingTicket() {
        Ticket ticket = ticketOwnedBy(2L);

        when(ticketRepository.findByTicketCode("TCK-001"))
                .thenReturn(Optional.of(ticket));

        Authentication authentication =
                authentication(1L, "USER");

        boolean allowed =
                authorizationService.canReadTicket(
                        authentication,
                        "TCK-001"
                );

        assertThat(allowed).isFalse();
    }

    @Test
    void shouldAllowStaffToReadTicket() {
        Authentication authentication =
                authentication(20L, "STAFF");

        boolean allowed =
                authorizationService.canReadTicket(
                        authentication,
                        "TCK-001"
                );

        assertThat(allowed).isTrue();
    }

    @Test
    void shouldAllowOwnerToCancelTicket() {
        Ticket ticket = ticketOwnedBy(1L);

        when(ticketRepository.findByTicketCode("TCK-001"))
                .thenReturn(Optional.of(ticket));

        Authentication authentication =
                authentication(1L, "USER");

        boolean allowed =
                authorizationService.canCancelTicket(
                        authentication,
                        "TCK-001"
                );

        assertThat(allowed).isTrue();
    }

    @Test
    void shouldRejectAnotherUserCancellingTicket() {
        Ticket ticket = ticketOwnedBy(2L);

        when(ticketRepository.findByTicketCode("TCK-001"))
                .thenReturn(Optional.of(ticket));

        Authentication authentication =
                authentication(1L, "USER");

        boolean allowed =
                authorizationService.canCancelTicket(
                        authentication,
                        "TCK-001"
                );

        assertThat(allowed).isFalse();
    }

    @Test
    void shouldAllowAdminToCancelTicket() {
        Authentication authentication =
                authentication(10L, "ADMIN");

        boolean allowed =
                authorizationService.canCancelTicket(
                        authentication,
                        "TCK-001"
                );

        assertThat(allowed).isTrue();
    }

    @Test
    void shouldAllowAnonymousToViewPublishedEvent() {
        Event event = mock(Event.class);

        when(event.getStatus())
                .thenReturn(EventStatus.PUBLISHED);

        when(eventRepository.findByEventCode("CMF-2026"))
                .thenReturn(Optional.of(event));

        boolean allowed =
                authorizationService.canViewEvent(
                        null,
                        "CMF-2026"
                );

        assertThat(allowed).isTrue();
    }

    @Test
    void shouldRejectAnonymousViewingDraftEvent() {
        Event event = mock(Event.class);

        when(event.getStatus())
                .thenReturn(EventStatus.DRAFT);

        when(eventRepository.findByEventCode("CMF-2026"))
                .thenReturn(Optional.of(event));

        boolean allowed =
                authorizationService.canViewEvent(
                        null,
                        "CMF-2026"
                );

        assertThat(allowed).isFalse();
    }

    @Test
    void shouldAllowStaffToViewDraftEvent() {
        Authentication authentication =
                authentication(20L, "STAFF");

        boolean allowed =
                authorizationService.canViewEvent(
                        authentication,
                        "CMF-2026"
                );

        assertThat(allowed).isTrue();
    }

    private Authentication authentication(
            Long userId,
            String role
    ) {
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + role)
        );

        SecurityPrincipal principal = new SecurityPrincipal(
                userId,
                "andrea",
                "andrea@example.com",
                "$2a$10$exampleHash",
                true,
                List.copyOf(authorities)
        );

        return new UsernamePasswordAuthenticationToken(
                principal,
                null,
                authorities
        );
    }

    private User userWithId(Long id) {
        User user = mock(User.class);

        when(user.getId()).thenReturn(id);

        return user;
    }

    private Ticket ticketOwnedBy(Long userId) {
        Ticket ticket = mock(Ticket.class);
        User user = userWithId(userId);

        when(ticket.getUser()).thenReturn(user);

        return ticket;
    }
}