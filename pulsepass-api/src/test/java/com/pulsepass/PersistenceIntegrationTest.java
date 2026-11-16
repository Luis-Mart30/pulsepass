package com.pulsepass;

import com.pulsepass.domain.Venue;
import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventCategory;
import com.pulsepass.domain.EventStatus;

import java.time.LocalDateTime;
import java.util.List;
import com.pulsepass.domain.Artist;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;

import java.time.LocalDate;
import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.TicketStatus;
import com.pulsepass.domain.TicketType;

import java.math.BigDecimal;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class PersistenceIntegrationTest {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private EntityManager entityManager;    

    @Test
    void shouldLoadArtistsInsertedByFlyway() {
        assertThat(artistRepository.findByStageName("Solar Beat")).isPresent();
        assertThat(artistRepository.findByStageName("Neon Waves")).isPresent();
        assertThat(artistRepository.findByStageName("Caribbean Sound")).isPresent();
        assertThat(artistRepository.findByStageName("Ocean Drive")).isPresent();
        assertThat(artistRepository.findByStageName("Digital Pulse")).isPresent();
    }

    @Test
void shouldPersistAndFindVenueByCode() {
    Venue venue = new Venue();
    venue.setCode("VEN-SMR-01");
    venue.setName("Marina Convention Center");
    venue.setCity("Santa Marta");
    venue.setAddress("Carrera 1 # 20-10");
    venue.setCapacity(5000);
    venue.setActive(true);

    Venue savedVenue = venueRepository.saveAndFlush(venue);

    assertThat(savedVenue.getId()).isNotNull();
    assertThat(venueRepository.findByCode("VEN-SMR-01"))
        .isPresent()
        .get()
        .satisfies(foundVenue -> {
            assertThat(foundVenue.getName())
                .isEqualTo("Marina Convention Center");
            assertThat(foundVenue.getCapacity()).isGreaterThan(0);
            assertThat(foundVenue.isActive()).isTrue();
        });
}

@Test
void shouldPersistAndQueryEventsCorrectly() {
    Venue venue = new Venue();
    venue.setCode("VEN-EVT-01");
    venue.setName("PulsePass Arena");
    venue.setCity("Santa Marta");
    venue.setAddress("Avenida del Libertador # 30-20");
    venue.setCapacity(5000);
    venue.setActive(true);
    venueRepository.saveAndFlush(venue);

    Event mainEvent = new Event();
    mainEvent.setEventCode("CMF-2026");
    mainEvent.setName("Caribbean Music Fest 2026");
    mainEvent.setDescription("Festival musical del Caribe");
    mainEvent.setCategory(EventCategory.MUSIC);
    mainEvent.setStatus(EventStatus.PUBLISHED);
    mainEvent.setEventDate(LocalDateTime.now().plusDays(10));
    mainEvent.setMinimumAge(12);
    mainEvent.setStreamingUrl("https://stream.pulsepass.com/cmf-2026");
    mainEvent.setVenue(venue);

    Event earlierEvent = new Event();
    earlierEvent.setEventCode("TECH-2026");
    earlierEvent.setName("Technology Conference 2026");
    earlierEvent.setDescription("Conferencia de tecnología");
    earlierEvent.setCategory(EventCategory.TECHNOLOGY);
    earlierEvent.setStatus(EventStatus.PUBLISHED);
    earlierEvent.setEventDate(LocalDateTime.now().plusDays(5));
    earlierEvent.setMinimumAge(0);
    earlierEvent.setVenue(venue);

    Event draftEvent = new Event();
    draftEvent.setEventCode("DRAFT-2026");
    draftEvent.setName("Draft Event");
    draftEvent.setDescription("Evento todavía no publicado");
    draftEvent.setCategory(EventCategory.ENTERTAINMENT);
    draftEvent.setStatus(EventStatus.DRAFT);
    draftEvent.setEventDate(LocalDateTime.now().plusDays(2));
    draftEvent.setMinimumAge(0);
    draftEvent.setVenue(venue);

    eventRepository.saveAllAndFlush(
        List.of(mainEvent, earlierEvent, draftEvent)
    );

    assertThat(eventRepository.findByEventCode("CMF-2026"))
        .isPresent()
        .get()
        .satisfies(foundEvent -> {
            assertThat(foundEvent.getVenue().getCode())
                .isEqualTo("VEN-EVT-01");
            assertThat(foundEvent.getStreamingUrl())
                .isEqualTo("https://stream.pulsepass.com/cmf-2026");
        });

    assertThat(
        eventRepository.findByStatusOrderByEventDateAsc(
            EventStatus.PUBLISHED
        )
    )
        .extracting(Event::getEventCode)
        .containsExactly("TECH-2026", "CMF-2026");

    assertThat(eventRepository.findByVenue_Code("VEN-EVT-01"))
        .hasSize(3);
}

@Test
void shouldPersistArtistsAndExecuteEventSearches() {
    Artist solarBeat = artistRepository
        .findByStageName("Solar Beat")
        .orElseThrow();

    Artist neonWaves = artistRepository
        .findByStageName("Neon Waves")
        .orElseThrow();

    Artist caribbeanSound = artistRepository
        .findByStageName("Caribbean Sound")
        .orElseThrow();

    Venue venue = new Venue();
    venue.setCode("VEN-ART-01");
    venue.setName("Caribbean Events Center");
    venue.setCity("Santa Marta");
    venue.setAddress("Calle 22 # 1-30");
    venue.setCapacity(4000);
    venue.setActive(true);
    venueRepository.saveAndFlush(venue);

    LocalDateTime firstDate =
        LocalDateTime.of(2026, 12, 10, 18, 0);

    LocalDateTime secondDate =
        LocalDateTime.of(2026, 12, 20, 20, 0);

    Event firstEvent = new Event();
    firstEvent.setEventCode("MUSIC-ART-01");
    firstEvent.setName("Caribbean Music Night");
    firstEvent.setDescription("Festival con tres artistas");
    firstEvent.setCategory(EventCategory.MUSIC);
    firstEvent.setStatus(EventStatus.PUBLISHED);
    firstEvent.setEventDate(firstDate);
    firstEvent.setMinimumAge(12);
    firstEvent.setVenue(venue);
    firstEvent.getArtists().add(solarBeat);
    firstEvent.getArtists().add(neonWaves);
    firstEvent.getArtists().add(caribbeanSound);
    firstEvent.getArtists().add(solarBeat);

    Event secondEvent = new Event();
    secondEvent.setEventCode("MUSIC-ART-02");
    secondEvent.setName("Solar Beat Live");
    secondEvent.setDescription("Concierto de Solar Beat");
    secondEvent.setCategory(EventCategory.MUSIC);
    secondEvent.setStatus(EventStatus.PUBLISHED);
    secondEvent.setEventDate(secondDate);
    secondEvent.setMinimumAge(10);
    secondEvent.setVenue(venue);
    secondEvent.getArtists().add(solarBeat);

    eventRepository.saveAllAndFlush(
        List.of(firstEvent, secondEvent)
    );

    assertThat(firstEvent.getArtists()).hasSize(3);

    assertThat(eventRepository.findByArtistStageName("solar beat"))
        .extracting(Event::getEventCode)
        .containsExactly("MUSIC-ART-01", "MUSIC-ART-02");

    assertThat(
        eventRepository.findByCityAndArtist(
            "santa marta",
            "SOLAR BEAT"
        )
    )
        .extracting(Event::getEventCode)
        .containsExactly("MUSIC-ART-01", "MUSIC-ART-02");

    assertThat(
        eventRepository.findRecommendedEvents(
            EventStatus.PUBLISHED,
            firstDate.minusDays(1),
            "SANTA MARTA",
            "solar"
        )
    )
        .extracting(Event::getEventCode)
        .containsExactly("MUSIC-ART-01", "MUSIC-ART-02");
}

@Test
void shouldPersistUserWithProfileAndFindEmailIgnoreCase() {
    User user = new User();
    user.setUsername("andrea.sierra");
    user.setEmail("Andrea.Sierra@pulsepass.com");
    user.setActive(true);

    UserProfile profile = new UserProfile();
    profile.setFirstName("Andrea");
    profile.setLastName("Sierra");
    profile.setPhone("3001234567");
    profile.setCity("Santa Marta");
    profile.setBirthDate(LocalDate.of(2001, 5, 15));

    user.assignProfile(profile);

    userRepository.saveAndFlush(user);

    assertThat(
        userRepository.findByEmailIgnoreCase(
            "andrea.sierra@PULSEPASS.COM"
        )
    )
        .isPresent()
        .get()
        .satisfies(foundUser -> {
            assertThat(foundUser.getUsername())
                .isEqualTo("andrea.sierra");
            assertThat(foundUser.isActive()).isTrue();
            assertThat(foundUser.getProfile()).isNotNull();
            assertThat(foundUser.getProfile().getFirstName())
                .isEqualTo("Andrea");
            assertThat(foundUser.getProfile().getCity())
                .isEqualTo("Santa Marta");
            assertThat(foundUser.getProfile().getBirthDate())
                .isEqualTo(LocalDate.of(2001, 5, 15));
        });
}

@Test
void shouldPersistAndQueryTicketsCorrectly() {
    Venue venue = new Venue();
    venue.setCode("VEN-TKT-01");
    venue.setName("PulsePass Arena");
    venue.setCity("Santa Marta");
    venue.setAddress("Avenida del Libertador");
    venue.setCapacity(3000);
    venue.setActive(true);

    venueRepository.saveAndFlush(venue);

    Event event = new Event();
    event.setEventCode("TKT-EVT-01");
    event.setName("PulsePass Music Festival");
    event.setDescription("Evento para comprobar los tickets");
    event.setCategory(EventCategory.MUSIC);
    event.setStatus(EventStatus.PUBLISHED);
    event.setEventDate(LocalDateTime.now().plusMonths(1));
    event.setMinimumAge(0);
    event.setVenue(venue);

    eventRepository.saveAndFlush(event);

    User user = new User();
    user.setUsername("ticket.user");
    user.setEmail("ticket.user@pulsepass.com");
    user.setActive(true);

    userRepository.saveAndFlush(user);

    Ticket paidVip = new Ticket();
    paidVip.setTicketCode("TCK-0001");
    paidVip.setType(TicketType.VIP);
    paidVip.setPrice(new BigDecimal("250000"));
    paidVip.setStatus(TicketStatus.PAID);
    paidVip.setPurchaseDate(LocalDateTime.now());
    paidVip.setUser(user);
    paidVip.setEvent(event);

    Ticket paidGeneral = new Ticket();
    paidGeneral.setTicketCode("TCK-0002");
    paidGeneral.setType(TicketType.GENERAL);
    paidGeneral.setPrice(new BigDecimal("120000"));
    paidGeneral.setStatus(TicketStatus.PAID);
    paidGeneral.setPurchaseDate(LocalDateTime.now());
    paidGeneral.setUser(user);
    paidGeneral.setEvent(event);

    Ticket reservedGeneral = new Ticket();
    reservedGeneral.setTicketCode("TCK-0003");
    reservedGeneral.setType(TicketType.GENERAL);
    reservedGeneral.setPrice(new BigDecimal("120000"));
    reservedGeneral.setStatus(TicketStatus.RESERVED);
    reservedGeneral.setPurchaseDate(LocalDateTime.now());
    reservedGeneral.setUser(user);
    reservedGeneral.setEvent(event);

    ticketRepository.saveAllAndFlush(
        List.of(paidVip, paidGeneral, reservedGeneral)
    );

    assertThat(ticketRepository.findByTicketCode("TCK-0001"))
        .isPresent()
        .get()
        .satisfies(foundTicket -> {
            assertThat(foundTicket.getType()).isEqualTo(TicketType.VIP);
            assertThat(foundTicket.getStatus()).isEqualTo(TicketStatus.PAID);
            assertThat(foundTicket.getUser().getEmail())
                .isEqualTo("ticket.user@pulsepass.com");
            assertThat(foundTicket.getEvent().getEventCode())
                .isEqualTo("TKT-EVT-01");
        });

    assertThat(
        ticketRepository.findByUser_EmailIgnoreCase(
            "TICKET.USER@PULSEPASS.COM"
        )
    ).hasSize(3);

    assertThat(
        ticketRepository.findByUser_EmailIgnoreCaseAndStatus(
            "TICKET.USER@PULSEPASS.COM",
            TicketStatus.PAID
        )
    )
        .extracting(Ticket::getTicketCode)
        .containsExactlyInAnyOrder("TCK-0001", "TCK-0002");

    assertThat(
        ticketRepository.findByEvent_EventCodeAndStatus(
            "TKT-EVT-01",
            TicketStatus.PAID
        )
    ).hasSize(2);

    assertThat(
        ticketRepository.countByEventCodeAndStatus(
            "TKT-EVT-01",
            TicketStatus.PAID
        )
    ).isEqualTo(2L);
    Ticket duplicatedTicket = new Ticket();
duplicatedTicket.setTicketCode("TCK-0001");
duplicatedTicket.setType(TicketType.GENERAL);
duplicatedTicket.setPrice(new BigDecimal("100000"));
duplicatedTicket.setStatus(TicketStatus.RESERVED);
duplicatedTicket.setPurchaseDate(LocalDateTime.now());
duplicatedTicket.setUser(user);
duplicatedTicket.setEvent(event);

assertThatThrownBy(
    () -> ticketRepository.saveAndFlush(duplicatedTicket)
).isInstanceOf(DataIntegrityViolationException.class);
}

@Test
void shouldRejectVenueWithNonPositiveCapacity() {
    Venue invalidVenue = new Venue();
    invalidVenue.setCode("VEN-INVALID-01");
    invalidVenue.setName("Invalid Venue");
    invalidVenue.setCity("Santa Marta");
    invalidVenue.setAddress("Calle de prueba");
    invalidVenue.setCapacity(0);
    invalidVenue.setActive(true);

    assertThatThrownBy(
        () -> venueRepository.saveAndFlush(invalidVenue)
    ).isInstanceOf(DataIntegrityViolationException.class);
}

@Test
void shouldRejectSecondProfileForSameUser() {
    User user = new User();
    user.setUsername("profile.unique.user");
    user.setEmail("profile.unique@pulsepass.com");
    user.setActive(true);

    UserProfile firstProfile = new UserProfile();
    firstProfile.setFirstName("Laura");
    firstProfile.setLastName("Martinez");
    firstProfile.setPhone("3001112233");
    firstProfile.setCity("Santa Marta");
    firstProfile.setBirthDate(LocalDate.of(2000, 4, 10));

    user.assignProfile(firstProfile);
    userRepository.saveAndFlush(user);

    UserProfile secondProfile = new UserProfile();
    secondProfile.setFirstName("Laura");
    secondProfile.setLastName("Martinez");
    secondProfile.setPhone("3009998877");
    secondProfile.setCity("Barranquilla");
    secondProfile.setBirthDate(LocalDate.of(2000, 4, 10));
    secondProfile.setUser(user);

    assertThatThrownBy(() -> {
        entityManager.persist(secondProfile);
        entityManager.flush();
    }).isInstanceOf(PersistenceException.class);
}

@Test
void shouldFindFutureTicketsOrderedByEventDate() {
    LocalDateTime referenceDate = LocalDateTime.now();

    Venue venue = new Venue();
    venue.setCode("VEN-FUTURE-01");
    venue.setName("Future Events Arena");
    venue.setCity("Santa Marta");
    venue.setAddress("Carrera 5 # 20-30");
    venue.setCapacity(4000);
    venue.setActive(true);

    venueRepository.saveAndFlush(venue);

    Event laterEvent = new Event();
    laterEvent.setEventCode("FUT-EVT-02");
    laterEvent.setName("Later Event");
    laterEvent.setDescription("Segundo evento futuro");
    laterEvent.setCategory(EventCategory.MUSIC);
    laterEvent.setStatus(EventStatus.PUBLISHED);
    laterEvent.setEventDate(referenceDate.plusDays(20));
    laterEvent.setMinimumAge(0);
    laterEvent.setVenue(venue);

    Event earlierEvent = new Event();
    earlierEvent.setEventCode("FUT-EVT-01");
    earlierEvent.setName("Earlier Event");
    earlierEvent.setDescription("Primer evento futuro");
    earlierEvent.setCategory(EventCategory.MUSIC);
    earlierEvent.setStatus(EventStatus.PUBLISHED);
    earlierEvent.setEventDate(referenceDate.plusDays(10));
    earlierEvent.setMinimumAge(0);
    earlierEvent.setVenue(venue);

    eventRepository.saveAllAndFlush(
        List.of(laterEvent, earlierEvent)
    );

    User user = new User();
    user.setUsername("future.ticket.user");
    user.setEmail("future.ticket@pulsepass.com");
    user.setActive(true);

    userRepository.saveAndFlush(user);

    Ticket laterTicket = new Ticket();
    laterTicket.setTicketCode("TCK-FUTURE-02");
    laterTicket.setType(TicketType.GENERAL);
    laterTicket.setPrice(new BigDecimal("150000"));
    laterTicket.setStatus(TicketStatus.PAID);
    laterTicket.setPurchaseDate(referenceDate);
    laterTicket.setUser(user);
    laterTicket.setEvent(laterEvent);

    Ticket earlierTicket = new Ticket();
    earlierTicket.setTicketCode("TCK-FUTURE-01");
    earlierTicket.setType(TicketType.GENERAL);
    earlierTicket.setPrice(new BigDecimal("100000"));
    earlierTicket.setStatus(TicketStatus.PAID);
    earlierTicket.setPurchaseDate(referenceDate);
    earlierTicket.setUser(user);
    earlierTicket.setEvent(earlierEvent);

    ticketRepository.saveAllAndFlush(
        List.of(laterTicket, earlierTicket)
    );

    assertThat(
        ticketRepository
            .findByEvent_EventDateAfterOrderByEvent_EventDateAsc(
                referenceDate
            )
    )
        .extracting(ticket -> ticket.getEvent().getEventCode())
        .containsExactly("FUT-EVT-01", "FUT-EVT-02");
        Ticket invalidPriceTicket = new Ticket();
invalidPriceTicket.setTicketCode("TCK-INVALID-PRICE");
invalidPriceTicket.setType(TicketType.GENERAL);
invalidPriceTicket.setPrice(new BigDecimal("-1000"));
invalidPriceTicket.setStatus(TicketStatus.RESERVED);
invalidPriceTicket.setPurchaseDate(referenceDate);
invalidPriceTicket.setUser(user);
invalidPriceTicket.setEvent(earlierEvent);

assertThatThrownBy(
    () -> ticketRepository.saveAndFlush(invalidPriceTicket)
).isInstanceOf(DataIntegrityViolationException.class);
}

}