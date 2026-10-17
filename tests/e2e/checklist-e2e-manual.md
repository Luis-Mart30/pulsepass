# Checklist de pruebas E2E manuales

## Información general

- Proyecto: PulsePass
- Responsable: Luis Jaime Martínez Monsalvo
- Herramienta: Postman
- Modalidad: ejecución manual mediante Send
- Base de datos: pulsepass_e2e
- Resultado final: 46 PASS, 0 FAIL, 0 BLOCKED, 0 NOT RUN

## Matriz de trazabilidad

| Requisito o módulo | Caso | Método | Ruta | Esperado | Obtenido | Resultado |
|---|---|---|---|---:|---:|---|
| 01 - Venues - Luis | VEN-01 - Listar venues activos - 200 | GET | `{{baseUrl}}/api/venues/active` | 200 | 200 | PASS |
| 01 - Venues - Luis | VEN-02 - Consultar venue por código - 200 | GET | `{{baseUrl}}/api/venues/{{venueCode}}` | 200 | 200 | PASS |
| 02 - Artistas - Luis | ART-01 - Listar artistas activos - 200 | GET | `{{baseUrl}}/api/artists/active` | 200 | 200 | PASS |
| 02 - Artistas - Luis | ART-02 - Consultar artista por ID - 200 | GET | `{{baseUrl}}/api/artists/{{artistId}}` | 200 | 200 | PASS |
| 02 - Artistas - Luis | ART-03 - Consultar artista por nombre artístico - 200 | GET | `{{baseUrl}}/api/artists/by-stage-name?stageName={{artistStageName}}` | 200 | 200 | PASS |
| 03 - Eventos - Luis | EVT-01 - Crear evento como ADMIN - 201 | POST | `{{baseUrl}}/api/events` | 201 | 201 | PASS |
| 03 - Eventos - Luis | EVT-02 - Consultar evento publicado por código - 200 | GET | `{{baseUrl}}/api/events/{{publishedEventCode}}` | 200 | 200 | PASS |
| 03 - Eventos - Luis | EVT-03 - Listar eventos publicados - 200 | GET | `{{baseUrl}}/api/events/published` | 200 | 200 | PASS |
| 03 - Eventos - Luis | EVT-04 - Publicar evento como ADMIN - 200 | PATCH | `{{baseUrl}}/api/events/{{publishEventCode}}/publish` | 200 | 200 | PASS |
| 03 - Eventos - Luis | EVT-05 - Asociar artista como ADMIN - 200 | POST | `{{baseUrl}}/api/events/{{createdEventCode}}/artists/{{artistId}}` | 200 | 200 | PASS |
| 03 - Eventos - Luis | EVT-06 - Buscar eventos por artista - 200 | GET | `{{baseUrl}}/api/events/by-artist?stageName={{artistStageName}}` | 200 | 200 | PASS |
| 04 - Escenarios negativos - Luis | NEG-EVT-01 - Crear evento inválido como ADMIN - 400 | POST | `{{baseUrl}}/api/events` | 400 | 400 | PASS |
| 04 - Escenarios negativos - Luis | NEG-EVT-02 - Crear evento sin autenticación - 401 | POST | `{{baseUrl}}/api/events` | 401 | 401 | PASS |
| 04 - Escenarios negativos - Luis | NEG-EVT-03 - Verificar rechazo anónimo sin mutación - 404 | GET | `{{baseUrl}}/api/events/EVT-E2E-DENIED-ANON` | 404 | 404 | PASS |
| 04 - Escenarios negativos - Luis | NEG-EVT-04 - Crear evento como STAFF - 403 | POST | `{{baseUrl}}/api/events` | 403 | 403 | PASS |
| 04 - Escenarios negativos - Luis | NEG-EVT-05 - Verificar rechazo STAFF sin mutación - 404 | GET | `{{baseUrl}}/api/events/EVT-E2E-DENIED-STAFF` | 404 | 404 | PASS |
| 04 - Escenarios negativos - Luis | NEG-EVT-06 - Consultar evento inexistente - 404 | GET | `{{baseUrl}}/api/events/EVT-E2E-NOT-FOUND` | 404 | 404 | PASS |
| 04 - Escenarios negativos - Luis | NEG-EVT-07 - Crear evento con código duplicado - 409 | POST | `{{baseUrl}}/api/events` | 409 | 409 | PASS |
| 05 - Usuarios y registro - Luis | USR-01 - Registrar USER_A - 201 | POST | `{{baseUrl}}/api/users` | 201 | 201 | PASS |
| 05 - Usuarios y registro - Luis | USR-02 - Registrar USER_B - 201 | POST | `{{baseUrl}}/api/users` | 201 | 201 | PASS |
| 05 - Usuarios y registro - Luis | USR-03 - Consultar usuario propio por correo - 200 | GET | `{{baseUrl}}/api/users/by-email?email={{userAEmail}}` | 200 | 200 | PASS |
| 05 - Usuarios y registro - Luis | USR-04 - Consultar usuario propio por username - 200 | GET | `{{baseUrl}}/api/users/by-username?username={{userAUsername}}` | 200 | 200 | PASS |
| 05 - Usuarios y registro - Luis | USR-05 - USER_A intenta consultar a USER_B - 403 | GET | `{{baseUrl}}/api/users/by-email?email={{userBEmail}}` | 403 | 403 | PASS |
| 05 - Usuarios y registro - Luis | USR-06 - Registrar USER_A duplicado - 409 | POST | `{{baseUrl}}/api/users` | 409 | 409 | PASS |
| 06 - Autenticación - Luis | AUTH-01 - Login ADMIN - 200 | POST | `{{baseUrl}}/api/auth/login` | 200 | 200 | PASS |
| 06 - Autenticación - Luis | AUTH-02 - Login STAFF - 200 | POST | `{{baseUrl}}/api/auth/login` | 200 | 200 | PASS |
| 06 - Autenticación - Luis | AUTH-03 - Login USER_A - 200 | POST | `{{baseUrl}}/api/auth/login` | 200 | 200 | PASS |
| 06 - Autenticación - Luis | AUTH-04 - Login USER_B - 200 | POST | `{{baseUrl}}/api/auth/login` | 200 | 200 | PASS |
| 06 - Autenticación - Luis | AUTH-05 - Consultar identidad USER_A - 200 | GET | `{{baseUrl}}/api/auth/me` | 200 | 200 | PASS |
| 06 - Autenticación - Luis | AUTH-06 - Consultar identidad sin autenticación - 401 | GET | `{{baseUrl}}/api/auth/me` | 401 | 401 | PASS |
| 06 - Autenticación - Luis | AUTH-07 - Login de usuario inactivo - 401 | POST | `{{baseUrl}}/api/auth/login` | 401 | 401 | PASS |
| 07 - Tickets y autorización - Luis | TKT-01 - USER_A compra ticket cancelable - 201 | POST | `{{baseUrl}}/api/tickets` | 201 | 201 | PASS |
| 07 - Tickets y autorización - Luis | TKT-02 - USER_A compra ticket utilizable - 201 | POST | `{{baseUrl}}/api/tickets` | 201 | 201 | PASS |
| 07 - Tickets y autorización - Luis | TKT-03 - USER_A lista sus tickets - 200 | GET | `{{baseUrl}}/api/tickets/by-user?email={{userAEmail}}` | 200 | 200 | PASS |
| 07 - Tickets y autorización - Luis | TKT-04 - USER_A consulta su ticket - 200 | GET | `{{baseUrl}}/api/tickets/{{cancelableTicketCode}}` | 200 | 200 | PASS |
| 07 - Tickets y autorización - Luis | TKT-05 - USER_B intenta leer ticket de USER_A - 403 | GET | `{{baseUrl}}/api/tickets/{{usableTicketCode}}` | 403 | 403 | PASS |
| 07 - Tickets y autorización - Luis | TKT-06 - USER_B intenta cancelar ticket de USER_A - 403 | PATCH | `{{baseUrl}}/api/tickets/{{cancelableTicketCode}}/cancel` | 403 | 403 | PASS |
| 07 - Tickets y autorización - Luis | TKT-07 - Verificar que cancelación prohibida no mutó - 200 | GET | `{{baseUrl}}/api/tickets/{{cancelableTicketCode}}` | 200 | 200 | PASS |
| 07 - Tickets y autorización - Luis | TKT-08 - STAFF lista tickets pagados del evento - 200 | GET | `{{baseUrl}}/api/events/{{publishedEventCode}}/tickets/paid` | 200 | 200 | PASS |
| 07 - Tickets y autorización - Luis | TKT-09 - USER_A cancela su ticket - 200 | PATCH | `{{baseUrl}}/api/tickets/{{cancelableTicketCode}}/cancel` | 200 | 200 | PASS |
| 07 - Tickets y autorización - Luis | TKT-10 - USER_A intenta usar ticket - 403 | PATCH | `{{baseUrl}}/api/tickets/{{usableTicketCode}}/use` | 403 | 403 | PASS |
| 07 - Tickets y autorización - Luis | TKT-11 - STAFF marca ticket como usado - 200 | PATCH | `{{baseUrl}}/api/tickets/{{usableTicketCode}}/use` | 200 | 200 | PASS |
| 07 - Tickets y autorización - Luis | TKT-12 - USER_A verifica ticket usado - 200 | GET | `{{baseUrl}}/api/tickets/{{usableTicketCode}}` | 200 | 200 | PASS |
| 07 - Tickets y autorización - Luis | TKT-13 - Cancelar nuevamente ticket cancelado - 409 | PATCH | `{{baseUrl}}/api/tickets/{{cancelableTicketCode}}/cancel` | 409 | 409 | PASS |
| 07 - Tickets y autorización - Luis | TKT-14 - Consultar ticket inexistente como ADMIN - 404 | GET | `{{baseUrl}}/api/tickets/TCK-E2E-NOT-FOUND` | 404 | 404 | PASS |
| 07 - Tickets y autorización - Luis | TKT-15 - USER_A intenta comprar para USER_B - 403 | POST | `{{baseUrl}}/api/tickets` | 403 | 403 | PASS |

## Cobertura verificada

- [x] Consultas públicas de venues, artistas y eventos.
- [x] Creación, publicación y asociación de artistas por ADMIN.
- [x] Registro de USER_A y USER_B.
- [x] Inicio de sesión y consulta de identidad.
- [x] Rechazo de usuario inactivo.
- [x] Compra, consulta, cancelación y uso de tickets.
- [x] Separación de permisos entre USER, STAFF y ADMIN.
- [x] Verificación posterior de operaciones prohibidas.
- [x] Respuestas 400, 401, 403, 404 y 409.
- [x] Ausencia de respuestas 500 esperadas o inesperadas.
- [x] Ejecución completamente manual, sin scripts, Runner, Newman ni CLI.
