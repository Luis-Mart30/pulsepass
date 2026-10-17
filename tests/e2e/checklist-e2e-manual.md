# Checklist de pruebas E2E manuales

## Información general

- Proyecto: PulsePass
- Responsable: Luis Jaime Martínez Monsalvo
- Herramienta: Postman
- Modalidad: ejecución manual mediante Send
- Base de datos: pulsepass_e2e
- Casos definidos: 96
- Estado inicial: 96 NOT RUN

## Estados permitidos

- PASS: el resultado coincide con lo esperado.
- FAIL: el resultado no coincide con lo esperado.
- BLOCKED: el caso no pudo ejecutarse por una dependencia.
- NOT RUN: el caso todavía no ha sido ejecutado.

## Matriz de trazabilidad

| # | Módulo o flujo | Caso | Método | Ruta | Esperado | Obtenido | Resultado | Observaciones |
|---:|---|---|---|---|---:|---:|---|---|
| 1 | 00 Preparación / conectividad | PRE-01 - Comprobar conectividad - 200 | GET | `{{baseUrl}}/api/venues/active` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 2 | 01 Venues | VEN-01 - Listar venues activos - 200 | GET | `{{baseUrl}}/api/venues/active` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 3 | 01 Venues | VEN-02 - Consultar venue por código - 200 | GET | `{{baseUrl}}/api/venues/{{venueCode}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 4 | 02 Artists | ART-01 - Listar artistas activos - 200 | GET | `{{baseUrl}}/api/artists/active` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 5 | 02 Artists | ART-02 - Consultar artista por ID - 200 | GET | `{{baseUrl}}/api/artists/{{artistId}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 6 | 02 Artists | ART-03 - Consultar artista por nombre artístico - 200 | GET | `{{baseUrl}}/api/artists/by-stage-name?stageName={{artistStageName}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 7 | 03 Auth / usuarios | USR-01 - Registrar USER_A - 201 | POST | `{{baseUrl}}/api/users` | 201 | 201 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 8 | 03 Auth / usuarios | USR-02 - Registrar USER_B - 201 | POST | `{{baseUrl}}/api/users` | 201 | 201 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 9 | 03 Auth / usuarios | AUTH-01 - Login ADMIN - 200 | POST | `{{baseUrl}}/api/auth/login` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 10 | 03 Auth / usuarios | AUTH-02 - Login STAFF - 200 | POST | `{{baseUrl}}/api/auth/login` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 11 | 03 Auth / usuarios | AUTH-03 - Login USER_A - 200 | POST | `{{baseUrl}}/api/auth/login` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 12 | 03 Auth / usuarios | AUTH-04 - Login USER_B - 200 | POST | `{{baseUrl}}/api/auth/login` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 13 | 03 Auth / usuarios | AUTH-05 - Consultar identidad USER_A - 200 | GET | `{{baseUrl}}/api/auth/me` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 14 | 03 Auth / usuarios | AUTH-06 - Consultar identidad sin autenticación - 401 | GET | `{{baseUrl}}/api/auth/me` | 401 | 401 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 15 | 03 Auth / usuarios | AUTH-07 - Login de usuario inactivo - 401 | POST | `{{baseUrl}}/api/auth/login` | 401 | 401 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 16 | 03 Auth / usuarios | TC-AUTH-003 - Login USER_A mediante email - 200 | POST | `{{baseUrl}}/api/auth/login` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 17 | 03 Auth / usuarios | TC-AUTH-004 - Rechazar contraseña incorrecta - 401 | POST | `{{baseUrl}}/api/auth/login` | 401 | 401 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 18 | 03 Auth / usuarios | TC-AUTH-005 - Rechazar identificador inexistente - 401 | POST | `{{baseUrl}}/api/auth/login` | 401 | 401 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 19 | 03 Auth / usuarios | TC-AUTH-006B - Consultar identidad USER_B - 200 | GET | `{{baseUrl}}/api/auth/me` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 20 | 03 Auth / usuarios | TC-AUTH-006S - Consultar identidad STAFF - 200 | GET | `{{baseUrl}}/api/auth/me` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 21 | 03 Auth / usuarios | TC-AUTH-006D - Consultar identidad ADMIN - 200 | GET | `{{baseUrl}}/api/auth/me` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 22 | 03 Auth / usuarios | TC-SEC-016A - Registrar usuario intentando inyectar ADMIN - 201 | POST | `{{baseUrl}}/api/users` | 201 | 201 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 23 | 03 Auth / usuarios | TC-SEC-016B - Login del usuario con intento de inyección - 200 | POST | `{{baseUrl}}/api/auth/login` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 24 | 03 Auth / usuarios | TC-SEC-016C - Comprobar que la inyección conserva rol USER - 200 | GET | `{{baseUrl}}/api/auth/me` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 25 | 03 Auth / usuarios | TC-AUTH-008 - Rechazar Bearer inventado o malformado - 401 | GET | `{{baseUrl}}/api/auth/me` | 401 | 401 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 26 | 03 Auth / usuarios | TC-AUTH-009 - Rechazar JWT alterado - 401 | GET | `{{baseUrl}}/api/auth/me` | 401 | 401 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 27 | 03 Auth / usuarios | TC-AUTH-010 - Rechazar JWT expirado - 401 | GET | `{{baseUrl}}/api/auth/me` | 401 | 401 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 28 | 03 Auth / usuarios | TC-AUTH-011 - Rechazar JWT de otra clave o issuer - 401 | GET | `{{baseUrl}}/api/auth/me` | 401 | 401 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 29 | 03 Auth / usuarios | TC-AUTH-012 - Rechazar token enviado por query string - 401 | GET | `{{baseUrl}}/api/auth/me?access_token={{userAToken}}` | 401 | 401 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 30 | 03 Auth / usuarios | TC-AUTH-CLAIMS - Inspeccionar claims obligatorios del JWT - 200 | GET | `{{baseUrl}}/api/auth/me` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 31 | 04 Usuarios / consulta y propiedad | USR-03 - Consultar usuario propio por correo - 200 | GET | `{{baseUrl}}/api/users/by-email?email={{userAEmail}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 32 | 04 Usuarios / consulta y propiedad | USR-04 - Consultar usuario propio por username - 200 | GET | `{{baseUrl}}/api/users/by-username?username={{userAUsername}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 33 | 04 Usuarios / consulta y propiedad | USR-05 - USER_A intenta consultar a USER_B - 403 | GET | `{{baseUrl}}/api/users/by-email?email={{userBEmail}}` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 34 | 04 Usuarios / consulta y propiedad | TC-SEC-007 - USER_B no consulta USER_A por username - 403 | GET | `{{baseUrl}}/api/users/by-username?username={{userAUsername}}` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 35 | 04 Usuarios / consulta y propiedad | TC-USR-ADMIN - ADMIN consulta USER_A por email - 200 | GET | `{{baseUrl}}/api/users/by-email?email={{userAEmail}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 36 | 05 Events / administración y visibilidad | EVT-01 - Crear evento como ADMIN - 201 | POST | `{{baseUrl}}/api/events` | 201 | 201 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 37 | 05 Events / administración y visibilidad | FLOW-C-02 - ADMIN consulta el evento recién creado en DRAFT - 200 | GET | `{{baseUrl}}/api/events/{{newEventCode}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 38 | 05 Events / administración y visibilidad | TC-SEC-004 - Anónimo no consulta el evento DRAFT creado - 403 | GET | `{{baseUrl}}/api/events/{{newEventCode}}` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 39 | 05 Events / administración y visibilidad | FLOW-C-04 - Comprobar que el evento DRAFT no aparece publicado - 200 | GET | `{{baseUrl}}/api/events/published` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 40 | 05 Events / administración y visibilidad | EVT-05 - Asociar artista como ADMIN - 200 | POST | `{{baseUrl}}/api/events/{{newEventCode}}/artists/{{artistId}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 41 | 05 Events / administración y visibilidad | EVT-04 - Publicar evento como ADMIN - 200 | PATCH | `{{baseUrl}}/api/events/{{newEventCode}}/publish` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 42 | 05 Events / administración y visibilidad | FLOW-C-06 - Consultar públicamente el evento recién publicado - 200 | GET | `{{baseUrl}}/api/events/{{newEventCode}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 43 | 05 Events / administración y visibilidad | EVT-02 - Consultar evento publicado por código - 200 | GET | `{{baseUrl}}/api/events/{{publishedEventCode}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 44 | 05 Events / administración y visibilidad | EVT-03 - Listar eventos publicados - 200 | GET | `{{baseUrl}}/api/events/published` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 45 | 05 Events / administración y visibilidad | EVT-06 - Buscar eventos por artista - 200 | GET | `{{baseUrl}}/api/events/by-artist?stageName={{artistStageName}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 46 | 06 Tickets / compra, consulta y ciclo de vida | TKT-01 - USER_A compra ticket cancelable - 201 | POST | `{{baseUrl}}/api/tickets` | 201 | 201 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 47 | 06 Tickets / compra, consulta y ciclo de vida | TKT-02 - USER_A compra ticket utilizable - 201 | POST | `{{baseUrl}}/api/tickets` | 201 | 201 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 48 | 06 Tickets / compra, consulta y ciclo de vida | TKT-03 - USER_A lista sus tickets - 200 | GET | `{{baseUrl}}/api/tickets/by-user?email={{userAEmail}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 49 | 06 Tickets / compra, consulta y ciclo de vida | TKT-04 - USER_A consulta su ticket - 200 | GET | `{{baseUrl}}/api/tickets/{{ticketCancelableCode}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 50 | 06 Tickets / compra, consulta y ciclo de vida | TKT-08 - STAFF lista tickets pagados del evento - 200 | GET | `{{baseUrl}}/api/events/{{publishedEventCode}}/tickets/paid` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 51 | 07 Seguridad / escenarios negativos | NEG-EVT-02 - Crear evento sin autenticación - 401 | POST | `{{baseUrl}}/api/events` | 401 | 401 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 52 | 07 Seguridad / escenarios negativos | NEG-EVT-04 - Crear evento como STAFF - 403 | POST | `{{baseUrl}}/api/events` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 53 | 07 Seguridad / escenarios negativos | NEG-EVT-05 - Verificar rechazo STAFF sin mutación - 404 | GET | `{{baseUrl}}/api/events/EVT-E2E-DENIED-STAFF` | 404 | 404 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 54 | 07 Seguridad / escenarios negativos | TKT-05 - USER_B intenta leer ticket de USER_A - 403 | GET | `{{baseUrl}}/api/tickets/{{ticketUsableCode}}` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 55 | 07 Seguridad / escenarios negativos | TKT-06 - USER_B intenta cancelar ticket de USER_A - 403 | PATCH | `{{baseUrl}}/api/tickets/{{ticketCancelableCode}}/cancel` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 56 | 07 Seguridad / escenarios negativos | TKT-07 - Verificar que cancelación prohibida no mutó - 200 | GET | `{{baseUrl}}/api/tickets/{{ticketCancelableCode}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 57 | 07 Seguridad / escenarios negativos | TKT-10 - USER_A intenta usar ticket - 403 | PATCH | `{{baseUrl}}/api/tickets/{{ticketUsableCode}}/use` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 58 | 07 Seguridad / escenarios negativos | TKT-15 - USER_A intenta comprar para USER_B - 403 | POST | `{{baseUrl}}/api/tickets` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 59 | 07 Seguridad / escenarios negativos | TC-AUTH-015 - JWT inválido no autentica en endpoint público - 200 | GET | `{{baseUrl}}/api/venues/active` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 60 | 07 Seguridad / escenarios negativos | TC-SEC-001B - USER_A no crea eventos - 403 | POST | `{{baseUrl}}/api/events` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 61 | 07 Seguridad / escenarios negativos | TC-SEC-002A - USER_A no publica borradores - 403 | PATCH | `{{baseUrl}}/api/events/{{draftEventCode}}/publish` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 62 | 07 Seguridad / escenarios negativos | TC-SEC-002B - STAFF no publica borradores - 403 | PATCH | `{{baseUrl}}/api/events/{{draftEventCode}}/publish` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 63 | 07 Seguridad / escenarios negativos | TC-SEC-003A - USER_A no asocia artistas - 403 | POST | `{{baseUrl}}/api/events/{{draftEventCode}}/artists/{{artistId}}` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 64 | 07 Seguridad / escenarios negativos | TC-SEC-003B - STAFF no asocia artistas - 403 | POST | `{{baseUrl}}/api/events/{{draftEventCode}}/artists/{{artistId}}` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 65 | 07 Seguridad / escenarios negativos | TC-SEC-005 - La búsqueda pública por artista no expone drafts - 200 | GET | `{{baseUrl}}/api/events/by-artist?stageName={{artistStageName}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 66 | 07 Seguridad / escenarios negativos | TC-SEC-015 - ADMIN consulta evento borrador - 200 | GET | `{{baseUrl}}/api/events/{{draftEventCode}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 67 | 07 Seguridad / escenarios negativos | TC-SEC-010 - USER_B no lista tickets de USER_A - 403 | GET | `{{baseUrl}}/api/tickets/by-user?email={{userAEmail}}` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 68 | 07 Seguridad / escenarios negativos | TC-SEC-012B - USER_B no marca como usado el ticket de USER_A - 403 | PATCH | `{{baseUrl}}/api/tickets/{{ticketUsableCode}}/use` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 69 | 07 Seguridad / escenarios negativos | TC-SEC-013 - USER_A no consulta tickets pagados del evento - 403 | GET | `{{baseUrl}}/api/events/{{publishedEventCode}}/tickets/paid` | 403 | 403 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 70 | 07 Seguridad / escenarios negativos | TC-SEC-008-VERIFY - Comprobar que la compra ajena no creó ticket - 200 | GET | `{{baseUrl}}/api/tickets/by-user?email={{userBEmail}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 71 | 08 Validaciones y errores HTTP | NEG-EVT-01 - Crear evento inválido como ADMIN - 400 | POST | `{{baseUrl}}/api/events` | 400 | 400 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 72 | 08 Validaciones y errores HTTP | NEG-EVT-03 - Verificar rechazo anónimo sin mutación - 404 | GET | `{{baseUrl}}/api/events/EVT-E2E-DENIED-ANON` | 404 | 404 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 73 | 08 Validaciones y errores HTTP | NEG-EVT-06 - Consultar evento inexistente - 404 | GET | `{{baseUrl}}/api/events/EVT-E2E-NOT-FOUND` | 404 | 404 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 74 | 08 Validaciones y errores HTTP | NEG-EVT-07 - Crear evento con código duplicado - 409 | POST | `{{baseUrl}}/api/events` | 409 | 409 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 75 | 08 Validaciones y errores HTTP | USR-06 - Registrar USER_A duplicado - 409 | POST | `{{baseUrl}}/api/users` | 409 | 409 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 76 | 08 Validaciones y errores HTTP | TKT-14 - Consultar ticket inexistente como ADMIN - 404 | GET | `{{baseUrl}}/api/tickets/TCK-E2E-NOT-FOUND` | 404 | 404 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 77 | 08 Validaciones y errores HTTP | TC-HTTP-400-REQUIRED - Rechazar campo obligatorio ausente - 400 | POST | `{{baseUrl}}/api/users` | 400 | 400 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 78 | 08 Validaciones y errores HTTP | TC-HTTP-400-EMAIL - Rechazar email inválido - 400 | POST | `{{baseUrl}}/api/users` | 400 | 400 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 79 | 08 Validaciones y errores HTTP | TC-HTTP-400-JSON - Rechazar JSON malformado - 400 | POST | `{{baseUrl}}/api/users` | 400 | 400 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 80 | 08 Validaciones y errores HTTP | TC-HTTP-400-EVENT-ENUM - Rechazar enum de evento inválido - 400 | POST | `{{baseUrl}}/api/events` | 400 | 400 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 81 | 08 Validaciones y errores HTTP | TC-HTTP-400-TICKET-ENUM - Rechazar enum de ticket inválido - 400 | POST | `{{baseUrl}}/api/tickets` | 400 | 400 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 82 | 08 Validaciones y errores HTTP | TC-BIZ-015-VENUE - Rechazar creación con venue inexistente - 404 | POST | `{{baseUrl}}/api/events` | 404 | 404 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 83 | 08 Validaciones y errores HTTP | TC-BIZ-015-ARTIST - Rechazar asociación con artista inexistente - 404 | POST | `{{baseUrl}}/api/events/{{draftEventCode}}/artists/999999999` | 404 | 404 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 84 | 08 Validaciones y errores HTTP | TC-BIZ-005-DUPLICATE - Rechazar asociación repetida de artista - 409 | POST | `{{baseUrl}}/api/events/{{publishedEventCode}}/artists/{{artistId}}` | 409 | 409 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 85 | 08 Validaciones y errores HTTP | TC-BIZ-014-DRAFT - Rechazar compra para evento no publicado - 409 | POST | `{{baseUrl}}/api/tickets` | 409 | 409 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 86 | 08 Validaciones y errores HTTP | TC-BIZ-014-AGE - Rechazar compra por edad mínima - 409 | POST | `{{baseUrl}}/api/tickets` | 409 | 409 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 87 | 08 Validaciones y errores HTTP | TC-BIZ-014-CAPACITY - Rechazar compra por aforo agotado - 409 | POST | `{{baseUrl}}/api/tickets` | 409 | 409 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 88 | 09 Flujos de negocio / secuencia recomendada | FLOW-A-01 - Revalidar eventos publicados - 200 | GET | `{{baseUrl}}/api/events/published` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 89 | 09 Flujos de negocio / secuencia recomendada | FLOW-B-01 - Revalidar identidad USER_A - 200 | GET | `{{baseUrl}}/api/auth/me` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 90 | 09 Flujos de negocio / secuencia recomendada | TKT-09 - USER_A cancela su ticket - 200 | PATCH | `{{baseUrl}}/api/tickets/{{ticketCancelableCode}}/cancel` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 91 | 09 Flujos de negocio / secuencia recomendada | TC-BIZ-010-GET - Verificar persistencia del ticket cancelado - 200 | GET | `{{baseUrl}}/api/tickets/{{ticketCancelableCode}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 92 | 09 Flujos de negocio / secuencia recomendada | TKT-13 - Cancelar nuevamente ticket cancelado - 409 | PATCH | `{{baseUrl}}/api/tickets/{{ticketCancelableCode}}/cancel` | 409 | 409 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 93 | 09 Flujos de negocio / secuencia recomendada | TKT-11 - STAFF marca ticket como usado - 200 | PATCH | `{{baseUrl}}/api/tickets/{{ticketUsableCode}}/use` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 94 | 09 Flujos de negocio / secuencia recomendada | TKT-12 - USER_A verifica ticket usado - 200 | GET | `{{baseUrl}}/api/tickets/{{ticketUsableCode}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 95 | 09 Flujos de negocio / secuencia recomendada | TC-BIZ-013 - Rechazar segundo uso del ticket - 409 | PATCH | `{{baseUrl}}/api/tickets/{{ticketUsableCode}}/use` | 409 | 409 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |
| 96 | 09 Flujos de negocio / secuencia recomendada | FLOW-D-01 - Revalidar tickets de USER_A - 200 | GET | `{{baseUrl}}/api/tickets/by-user?email={{userAEmail}}` | 200 | 200 | PASS | Ejecutado manualmente en Postman el 17 de octubre de 2026 |

## Resumen actual

| Estado | Cantidad |
|---|---:|
| PASS | 0 |
| FAIL | 0 |
| BLOCKED | 0 |
| NOT RUN | 96 |

La columna Obtenido y el resultado de cada caso deben actualizarse únicamente después de ejecutar la solicitud manualmente en Postman.
