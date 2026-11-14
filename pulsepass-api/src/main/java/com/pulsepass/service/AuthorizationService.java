package com.pulsepass.service;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.User;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.security.SecurityPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("authorizationService")
@Transactional(readOnly = true)
public class AuthorizationService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;

    public AuthorizationService(
            UserRepository userRepository,
            TicketRepository ticketRepository,
            EventRepository eventRepository
    ) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.eventRepository = eventRepository;
    }

    public boolean isSelfOrAdminByEmail(
            Authentication authentication,
            String email
    ) {
        return hasRole(authentication, "ADMIN")
                || isSelfByEmail(authentication, email);
    }

    public boolean isSelfOrAdminByUsername(
            Authentication authentication,
            String username
    ) {
        return hasRole(authentication, "ADMIN")
                || isSelfByUsername(authentication, username);
    }

    public boolean canPurchaseForEmail(
            Authentication authentication,
            String email
    ) {
        return hasRole(authentication, "USER")
                && isSelfByEmail(authentication, email);
    }

    public boolean canReadTicket(
            Authentication authentication,
            String ticketCode
    ) {
        return hasAnyRole(authentication, "STAFF", "ADMIN")
                || isTicketOwner(authentication, ticketCode);
    }

    public boolean canReadTicketsByEmail(
            Authentication authentication,
            String email
    ) {
        return hasRole(authentication, "ADMIN")
                || isSelfByEmail(authentication, email);
    }

    public boolean canCancelTicket(
            Authentication authentication,
            String ticketCode
    ) {
        return hasRole(authentication, "ADMIN")
                || (
                hasRole(authentication, "USER")
                        && isTicketOwner(
                        authentication,
                        ticketCode
                )
        );
    }

    public boolean canViewEvent(
            Authentication authentication,
            String eventCode
    ) {
        if (hasAnyRole(authentication, "STAFF", "ADMIN")) {
            return true;
        }

        return eventRepository.findByEventCode(eventCode)
                .map(Event::getStatus)
                .filter(EventStatus.PUBLISHED::equals)
                .isPresent();
    }

    public boolean canViewNonPublishedEvents(
            Authentication authentication
    ) {
        return hasAnyRole(authentication, "STAFF", "ADMIN");
    }

    private boolean isSelfByEmail(
            Authentication authentication,
            String email
    ) {
        SecurityPrincipal principal = getPrincipal(authentication);

        if (principal == null) {
            return false;
        }

        return userRepository.findByEmailIgnoreCase(email)
                .map(User::getId)
                .filter(principal.getUserId()::equals)
                .isPresent();
    }

    private boolean isSelfByUsername(
            Authentication authentication,
            String username
    ) {
        SecurityPrincipal principal = getPrincipal(authentication);

        if (principal == null) {
            return false;
        }

        return userRepository.findByUsername(username)
                .map(User::getId)
                .filter(principal.getUserId()::equals)
                .isPresent();
    }

    private boolean isTicketOwner(
            Authentication authentication,
            String ticketCode
    ) {
        SecurityPrincipal principal = getPrincipal(authentication);

        if (principal == null) {
            return false;
        }

        return ticketRepository.findByTicketCode(ticketCode)
                .map(Ticket::getUser)
                .map(User::getId)
                .filter(principal.getUserId()::equals)
                .isPresent();
    }

    private SecurityPrincipal getPrincipal(
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                instanceof SecurityPrincipal principal)) {
            return null;
        }

        return principal;
    }

    private boolean hasRole(
            Authentication authentication,
            String role
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()) {
            return false;
        }

        String expectedAuthority = "ROLE_" + role;

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        expectedAuthority.equals(
                                authority.getAuthority()
                        )
                );
    }

    private boolean hasAnyRole(
            Authentication authentication,
            String... roles
    ) {
        for (String role : roles) {
            if (hasRole(authentication, role)) {
                return true;
            }
        }

        return false;
    }
}