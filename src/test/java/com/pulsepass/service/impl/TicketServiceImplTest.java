package com.pulsepass.service.impl;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventCategory;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.TicketStatus;
import com.pulsepass.domain.TicketType;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;
import com.pulsepass.domain.Venue;
import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.TicketMapper;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    private static final String USER_EMAIL =
            "usuario@unimagdalena.edu.co";
    private static final String EVENT_CODE = "EVT-001";
    private static final String TICKET_CODE = "TCK-001";

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TicketMapper ticketMapper;

    @InjectMocks
    private TicketServiceImpl ticketService;

    @Test
    void shouldPurchaseValidTicketAsPaid() {
        User user = createAdultActiveUser();
        Event event = createEvent(
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                3
        );
        TicketResponse response = prepareValidPurchase(
                user,
                event,
                0,
                TicketType.GENERAL
        );

        TicketResponse result = ticketService.purchase(
                createRequest(TicketType.GENERAL)
        );

        ArgumentCaptor<Ticket> captor =
                ArgumentCaptor.forClass(Ticket.class);

        verify(ticketRepository).save(captor.capture());

        Ticket savedTicket = captor.getValue();

        assertThat(result).isSameAs(response);
        assertThat(savedTicket.getStatus())
                .isEqualTo(TicketStatus.PAID);
        assertThat(savedTicket.getPrice())
                .isEqualByComparingTo("100000.00");
        assertThat(savedTicket.getUser()).isSameAs(user);
        assertThat(savedTicket.getEvent()).isSameAs(event);
        assertThat(savedTicket.getTicketCode())
                .startsWith("TCK-");
        assertThat(savedTicket.getPurchaseDate()).isNotNull();

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void shouldRejectPurchaseWhenUserDoesNotExist() {
        when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.purchase(
                createRequest(TicketType.GENERAL)
        )).isInstanceOf(ResourceNotFoundException.class);

        verify(eventRepository, never())
                .findByEventCode(any(String.class));
        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void shouldRejectPurchaseWhenUserIsInactive() {
        User user = createAdultActiveUser();
        user.setActive(false);

        when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                .thenReturn(Optional.of(user));

        assertThatThrownBy(() -> ticketService.purchase(
                createRequest(TicketType.GENERAL)
        )).isInstanceOf(BusinessRuleException.class);

        verify(eventRepository, never())
                .findByEventCode(any(String.class));
        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void shouldRejectPurchaseWhenEventDoesNotExist() {
        User user = createAdultActiveUser();

        when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                .thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode(EVENT_CODE))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.purchase(
                createRequest(TicketType.GENERAL)
        )).isInstanceOf(ResourceNotFoundException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void shouldRejectPurchaseForDraftEvent() {
        User user = createAdultActiveUser();
        Event event = createEvent(
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(10),
                3
        );

        prepareUserAndEvent(user, event);

        assertThatThrownBy(() -> ticketService.purchase(
                createRequest(TicketType.GENERAL)
        )).isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void shouldRejectPurchaseForCancelledEvent() {
        User user = createAdultActiveUser();
        Event event = createEvent(
                EventStatus.CANCELLED,
                LocalDateTime.now().plusDays(10),
                3
        );

        prepareUserAndEvent(user, event);

        assertThatThrownBy(() -> ticketService.purchase(
                createRequest(TicketType.GENERAL)
        )).isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void shouldRejectPurchaseForPastEvent() {
        User user = createAdultActiveUser();
        Event event = createEvent(
                EventStatus.PUBLISHED,
                LocalDateTime.now().minusDays(1),
                3
        );

        prepareUserAndEvent(user, event);

        assertThatThrownBy(() -> ticketService.purchase(
                createRequest(TicketType.GENERAL)
        )).isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void shouldRejectPurchaseWhenUserIsUnderMinimumAge() {
        Event event = createEvent(
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                3
        );

        User user = createUserWithBirthDate(
                event.getEventDate()
                        .toLocalDate()
                        .minusYears(17)
        );

        prepareUserAndEvent(user, event);

        assertThatThrownBy(() -> ticketService.purchase(
                createRequest(TicketType.GENERAL)
        )).isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .countByEventCodeAndStatus(
                        any(String.class),
                        any(TicketStatus.class)
                );
        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void shouldRejectPurchaseWhenEventHasNoCapacity() {
        User user = createAdultActiveUser();
        Event event = createEvent(
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                3
        );

        prepareUserAndEvent(user, event);

        when(ticketRepository.countByEventCodeAndStatus(
                eq(EVENT_CODE),
                eq(TicketStatus.PAID)
        )).thenReturn(3L);

        assertThatThrownBy(() -> ticketService.purchase(
                createRequest(TicketType.GENERAL)
        )).isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
        verify(eventRepository, never())
                .save(any(Event.class));
    }

    @Test
    void shouldMarkEventSoldOutWhenLastTicketIsPurchased() {
        User user = createAdultActiveUser();
        Event event = createEvent(
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                3
        );

        prepareValidPurchase(
                user,
                event,
                2,
                TicketType.GENERAL
        );

        ticketService.purchase(
                createRequest(TicketType.GENERAL)
        );

        assertThat(event.getStatus())
                .isEqualTo(EventStatus.SOLD_OUT);

        verify(ticketRepository).save(any(Ticket.class));
        verify(eventRepository).save(event);
    }

    @ParameterizedTest
    @MethodSource("ticketPriceCases")
    void shouldCalculatePriceAccordingToTicketType(
            TicketType type,
            String expectedPrice
    ) {
        User user = createAdultActiveUser();
        Event event = createEvent(
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                3
        );

        prepareValidPurchase(user, event, 0, type);

        ticketService.purchase(createRequest(type));

        ArgumentCaptor<Ticket> captor =
                ArgumentCaptor.forClass(Ticket.class);

        verify(ticketRepository).save(captor.capture());

        assertThat(captor.getValue().getPrice())
                .isEqualByComparingTo(expectedPrice);
    }

    @Test
    void shouldCancelPaidTicket() {
        Event event = createEvent(
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                3
        );
        Ticket ticket = createTicket(TicketStatus.PAID, event);
        TicketResponse response = mockResponse();

        when(ticketRepository.findByTicketCode(TICKET_CODE))
                .thenReturn(Optional.of(ticket));
        when(ticketRepository.save(ticket))
                .thenReturn(ticket);
        when(ticketMapper.toResponse(ticket))
                .thenReturn(response);

        TicketResponse result =
                ticketService.cancel(TICKET_CODE);

        assertThat(result).isSameAs(response);
        assertThat(ticket.getStatus())
                .isEqualTo(TicketStatus.CANCELLED);

        verify(ticketRepository).save(ticket);
    }

    @Test
    void shouldRejectCancellationOfUsedTicket() {
        Event event = createEvent(
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                3
        );
        Ticket ticket = createTicket(TicketStatus.USED, event);

        when(ticketRepository.findByTicketCode(TICKET_CODE))
                .thenReturn(Optional.of(ticket));

        assertThatThrownBy(() ->
                ticketService.cancel(TICKET_CODE)
        ).isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void shouldRejectCancellationAfterEventDate() {
        Event event = createEvent(
                EventStatus.FINISHED,
                LocalDateTime.now().minusDays(1),
                3
        );
        Ticket ticket = createTicket(TicketStatus.PAID, event);

        when(ticketRepository.findByTicketCode(TICKET_CODE))
                .thenReturn(Optional.of(ticket));

        assertThatThrownBy(() ->
                ticketService.cancel(TICKET_CODE)
        ).isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    @Test
    void shouldMarkPaidTicketAsUsed() {
        Event event = createEvent(
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                3
        );
        Ticket ticket = createTicket(TicketStatus.PAID, event);
        TicketResponse response = mockResponse();

        when(ticketRepository.findByTicketCode(TICKET_CODE))
                .thenReturn(Optional.of(ticket));
        when(ticketRepository.save(ticket))
                .thenReturn(ticket);
        when(ticketMapper.toResponse(ticket))
                .thenReturn(response);

        TicketResponse result =
                ticketService.markAsUsed(TICKET_CODE);

        assertThat(result).isSameAs(response);
        assertThat(ticket.getStatus())
                .isEqualTo(TicketStatus.USED);

        verify(ticketRepository).save(ticket);
    }

    @Test
    void shouldRejectUsingCancelledTicket() {
        Event event = createEvent(
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10),
                3
        );
        Ticket ticket = createTicket(
                TicketStatus.CANCELLED,
                event
        );

        when(ticketRepository.findByTicketCode(TICKET_CODE))
                .thenReturn(Optional.of(ticket));

        assertThatThrownBy(() ->
                ticketService.markAsUsed(TICKET_CODE)
        ).isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never())
                .save(any(Ticket.class));
    }

    private void prepareUserAndEvent(
            User user,
            Event event
    ) {
        when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                .thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode(EVENT_CODE))
                .thenReturn(Optional.of(event));
    }

    private TicketResponse prepareValidPurchase(
            User user,
            Event event,
            long paidTickets,
            TicketType type
    ) {
        TicketResponse response = mockResponse();

        prepareUserAndEvent(user, event);

        when(ticketRepository.countByEventCodeAndStatus(
                eq(EVENT_CODE),
                eq(TicketStatus.PAID)
        )).thenReturn(paidTickets);

        when(ticketRepository.save(any(Ticket.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );

        when(ticketMapper.toResponse(any(Ticket.class)))
                .thenReturn(response);

        return response;
    }

    private PurchaseTicketRequest createRequest(
            TicketType type
    ) {
        return new PurchaseTicketRequest(
                USER_EMAIL,
                EVENT_CODE,
                type
        );
    }

    private User createAdultActiveUser() {
        return createUserWithBirthDate(
                LocalDate.now().minusYears(25)
        );
    }

    private User createUserWithBirthDate(
            LocalDate birthDate
    ) {
        User user = new User(
                "usuario",
                USER_EMAIL
        );
        user.setActive(true);

        UserProfile profile = new UserProfile(
                "Andrea",
                "Pérez",
                "3001234567",
                "Santa Marta",
                birthDate
        );

        user.assignProfile(profile);

        return user;
    }

    private Event createEvent(
            EventStatus status,
            LocalDateTime eventDate,
            int capacity
    ) {
        Venue venue = new Venue(
                "VEN-001",
                "Auditorio principal",
                "Santa Marta",
                "Universidad del Magdalena",
                capacity
        );

        return new Event(
                EVENT_CODE,
                "Concierto PulsePass",
                "Evento de prueba",
                EventCategory.ENTERTAINMENT,
                status,
                eventDate,
                18,
                venue
        );
    }

    private Ticket createTicket(
            TicketStatus status,
            Event event
    ) {
        return new Ticket(
                TICKET_CODE,
                TicketType.GENERAL,
                new BigDecimal("100000.00"),
                status,
                LocalDateTime.now(),
                createAdultActiveUser(),
                event
        );
    }

    private TicketResponse mockResponse() {
        return org.mockito.Mockito.mock(
                TicketResponse.class
        );
    }

    private static Stream<Arguments> ticketPriceCases() {
        return Stream.of(
                Arguments.of(
                        TicketType.GENERAL,
                        "100000.00"
                ),
                Arguments.of(
                        TicketType.STUDENT,
                        "80000.00"
                ),
                Arguments.of(
                        TicketType.VIP,
                        "150000.00"
                ),
                Arguments.of(
                        TicketType.BACKSTAGE,
                        "200000.00"
                )
        );
    }
}