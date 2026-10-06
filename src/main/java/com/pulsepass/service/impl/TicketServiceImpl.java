package com.pulsepass.service.impl;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.TicketStatus;
import com.pulsepass.domain.TicketType;
import com.pulsepass.domain.User;
import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.TicketMapper;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.TicketService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class TicketServiceImpl implements TicketService {

    private static final BigDecimal GENERAL_PRICE =
            new BigDecimal("100000.00");
    private static final BigDecimal STUDENT_FACTOR =
            new BigDecimal("0.80");
    private static final BigDecimal VIP_FACTOR =
            new BigDecimal("1.50");
    private static final BigDecimal BACKSTAGE_FACTOR =
            new BigDecimal("2.00");

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketMapper ticketMapper;

    public TicketServiceImpl(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            EventRepository eventRepository,
            TicketMapper ticketMapper
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.ticketMapper = ticketMapper;
    }

    @Override
    @Transactional
    public TicketResponse purchase(
            PurchaseTicketRequest request
    ) {
        User user = findUser(request.userEmail());
        validateActiveUser(user);

        Event event = findEvent(request.eventCode());
        validatePurchasableEvent(event);
        validateMinimumAge(user, event);

        long paidTickets =
                ticketRepository.countByEventCodeAndStatus(
                        event.getEventCode(),
                        TicketStatus.PAID
                );

        validateCapacity(event, paidTickets);

        BigDecimal price = calculatePrice(request.type());

        if (price.signum() < 0) {
            throw new BusinessRuleException(
                    "Ticket price cannot be negative."
            );
        }

        Ticket ticket = new Ticket();
        ticket.setTicketCode(generateTicketCode());
        ticket.setType(request.type());
        ticket.setPrice(price);
        ticket.setStatus(TicketStatus.PAID);
        ticket.setPurchaseDate(LocalDateTime.now());
        ticket.setUser(user);
        ticket.setEvent(event);

        Ticket savedTicket = ticketRepository.save(ticket);

        if (paidTickets + 1 == event.getVenue().getCapacity()) {
            event.setStatus(EventStatus.SOLD_OUT);
            eventRepository.save(event);
        }

        return ticketMapper.toResponse(savedTicket);
    }

    @Override
    public TicketResponse findByCode(String ticketCode) {
        return findTicket(ticketCode)
                .map(ticketMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket not found: " + ticketCode
                ));
    }

    @Override
    public List<TicketResponse> findByUserEmail(String email) {
        return ticketRepository
                .findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(
                        email
                )
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    public List<TicketResponse> findPaidTicketsByEvent(
            String eventCode
    ) {
        return ticketRepository
                .findByEvent_EventCodeAndStatus(
                        eventCode,
                        TicketStatus.PAID
                )
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public TicketResponse cancel(String ticketCode) {
        Ticket ticket = findRequiredTicket(ticketCode);

        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException(
                    "Only PAID tickets can be cancelled."
            );
        }

        if (!ticket.getEvent().getEventDate()
                .isAfter(LocalDateTime.now())) {
            throw new BusinessRuleException(
                    "Ticket cannot be cancelled after the event date."
            );
        }

        ticket.setStatus(TicketStatus.CANCELLED);

        Ticket savedTicket = ticketRepository.save(ticket);

        return ticketMapper.toResponse(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponse markAsUsed(String ticketCode) {
        Ticket ticket = findRequiredTicket(ticketCode);

        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException(
                    "Only PAID tickets can be marked as used."
            );
        }

        ticket.setStatus(TicketStatus.USED);

        Ticket savedTicket = ticketRepository.save(ticket);

        return ticketMapper.toResponse(savedTicket);
    }

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + email
                ));
    }

    private Event findEvent(String eventCode) {
        return eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Event not found: " + eventCode
                ));
    }

    private java.util.Optional<Ticket> findTicket(
            String ticketCode
    ) {
        return ticketRepository.findByTicketCode(ticketCode);
    }

    private Ticket findRequiredTicket(String ticketCode) {
        return ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket not found: " + ticketCode
                ));
    }

    private void validateActiveUser(User user) {
        if (!user.isActive()) {
            throw new BusinessRuleException(
                    "User must be active."
            );
        }
    }

    private void validatePurchasableEvent(Event event) {
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessRuleException(
                    "Tickets can only be purchased for published events."
            );
        }

        if (!event.getEventDate().isAfter(LocalDateTime.now())) {
            throw new BusinessRuleException(
                    "Cannot purchase tickets for a past event."
            );
        }
    }

    private void validateMinimumAge(User user, Event event) {
        if (event.getMinimumAge() <= 0) {
            return;
        }

        if (user.getProfile() == null
                || user.getProfile().getBirthDate() == null) {
            throw new BusinessRuleException(
                    "User birth date is required."
            );
        }

        LocalDate eventDate = event.getEventDate().toLocalDate();

        int age = Period.between(
                user.getProfile().getBirthDate(),
                eventDate
        ).getYears();

        if (age < event.getMinimumAge()) {
            throw new BusinessRuleException(
                    "User does not meet minimum age."
            );
        }
    }

    private void validateCapacity(
            Event event,
            long paidTickets
    ) {
        if (paidTickets >= event.getVenue().getCapacity()) {
            throw new BusinessRuleException(
                    "Event has no available capacity."
            );
        }
    }

    private BigDecimal calculatePrice(TicketType type) {
        return switch (type) {
            case GENERAL -> GENERAL_PRICE;
            case STUDENT -> GENERAL_PRICE.multiply(
                    STUDENT_FACTOR
            );
            case VIP -> GENERAL_PRICE.multiply(VIP_FACTOR);
            case BACKSTAGE -> GENERAL_PRICE.multiply(
                    BACKSTAGE_FACTOR
            );
        };
    }

    private String generateTicketCode() {
        return "TCK-"
                + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }
}