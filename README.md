# PulsePass

## Integrantes

- **Luis Jaime Martínez Monsalvo** — Código: 2023214025
- **Angélica Sierra Zapata** — Código: 2023214030

## Descripción

PulsePass es un proyecto académico desarrollado con Java 21 y Spring Boot 4.1.1 para gestionar eventos, escenarios, artistas, usuarios y tickets.

El proyecto implementa las capas de persistencia, servicios y controladores REST. La información se almacena en PostgreSQL, las migraciones se administran mediante Flyway y las reglas de negocio se ejecutan desde servicios transaccionales.

La API REST permite consultar escenarios y artistas, crear y publicar eventos, registrar usuarios, comprar tickets y actualizar el estado de los tickets.

## Tecnologías utilizadas

- Java 21
- Spring Boot 4.1.1
- Spring MVC
- Jakarta Bean Validation
- Spring Data JPA
- Hibernate
- PostgreSQL
- Flyway
- MapStruct
- Maven Wrapper
- Docker Desktop
- Testcontainers
- JUnit 5
- Mockito
- AssertJ
- MockMvc

## Arquitectura del proyecto

El proyecto utiliza una arquitectura organizada por capas:

- **Controller:** recibe solicitudes HTTP, valida los datos de entrada y devuelve respuestas HTTP.
- **Service:** implementa las reglas de negocio y administra las transacciones.
- **Repository:** permite consultar y almacenar información mediante Spring Data JPA.
- **Domain:** contiene las entidades y enumeraciones del modelo.
- **DTO:** define los objetos utilizados en las solicitudes y respuestas de la API.
- **Mapper:** convierte entidades del dominio en DTOs y viceversa.
- **Exception:** contiene las excepciones personalizadas y el manejador global de errores.

Los controladores dependen únicamente de interfaces de servicio. No acceden directamente a repositories ni implementan reglas de negocio.

## Modelo de dominio

El sistema contiene las siguientes entidades:

- `Venue`: representa el lugar donde se realiza un evento.
- `Event`: almacena la información de un evento.
- `Artist`: representa a los artistas participantes.
- `User`: contiene los datos principales de un usuario.
- `UserProfile`: almacena la información personal del usuario.
- `Ticket`: representa una entrada comprada para un evento.

### Relaciones

- Un `Venue` puede tener muchos `Event`.
- Un `Event` pertenece a un único `Venue`.
- Un `Event` puede tener varios `Artist`.
- Un `Artist` puede participar en varios `Event`.
- Un `User` puede tener un solo `UserProfile`.
- Un `User` puede tener varios `Ticket`.
- Un `Event` puede tener varios `Ticket`.
- Cada `Ticket` pertenece a un `User` y a un `Event`.

## Reglas de integridad

PostgreSQL protege las reglas estructurales que siempre deben cumplirse:

- Los códigos de venues, eventos y tickets son únicos.
- El nombre artístico, el nombre de usuario y el correo electrónico son únicos.
- La capacidad de un venue debe ser mayor que cero.
- El precio de un ticket no puede ser negativo.
- Un usuario no puede tener más de un perfil.
- Un ticket debe estar relacionado con un usuario y un evento.
- La relación entre eventos y artistas no permite asociaciones duplicadas.
- Los valores enumerados se almacenan por nombre y no por posición.

Las reglas que requieren decisiones de negocio se administran desde la capa Service, como publicar eventos, agregar artistas, comprar tickets, cancelar tickets y marcarlos como usados.

## Migraciones con Flyway

El esquema de la base de datos se administra mediante Flyway.

### V1__create_schema.sql

Crea las tablas principales:

- `venues`
- `events`
- `artists`
- `event_artists`
- `users`
- `user_profiles`
- `tickets`

También crea las claves primarias, claves foráneas, restricciones `UNIQUE`, restricciones `CHECK` e índices.

### V2__insert_initial_artists.sql

Inserta los siguientes artistas iniciales:

- Solar Beat
- Neon Waves
- Caribbean Sound
- Ocean Drive
- Digital Pulse

### V3__add_streaming_url_to_event.sql

Agrega a la tabla `events` la columna opcional:

```sql
streaming_url VARCHAR(500)
```

Esta modificación se realizó mediante una migración independiente para no alterar una migración que ya podría haber sido aplicada.

## Repositories

Los repositories extienden `JpaRepository` y proporcionan las operaciones de persistencia y consulta.

Se implementaron:

- `VenueRepository`
- `ArtistRepository`
- `EventRepository`
- `UserRepository`
- `TicketRepository`

## Consultas implementadas

### Query Methods

Los Query Methods se utilizan para consultas sencillas y fáciles de interpretar, por ejemplo:

- Buscar un venue por su código.
- Buscar un artista por su nombre artístico.
- Buscar un evento por su código.
- Buscar un usuario por correo sin diferenciar mayúsculas.
- Listar eventos publicados ordenados por fecha.
- Buscar eventos por el código del venue.
- Buscar tickets por correo del usuario.
- Buscar tickets por correo y estado.
- Buscar tickets por evento y estado.
- Consultar tickets de eventos futuros ordenados por fecha.

### Consultas JPQL

JPQL se utiliza cuando la consulta necesita recorrer varias relaciones, aplicar filtros combinados o realizar agregaciones:

- Buscar eventos por artista.
- Buscar eventos por ciudad y artista.
- Recomendar eventos publicados por fecha, ciudad y texto del artista.
- Contar tickets de un evento según su estado.

No se utilizó SQL nativo para implementar las consultas del taller.

## Capa de servicios

La capa de servicios concentra las reglas de negocio y evita que los controladores accedan directamente a la persistencia.

Se implementaron las siguientes interfaces y sus respectivas implementaciones:

- `VenueService`
- `ArtistService`
- `EventService`
- `UserService`
- `TicketService`

Los servicios utilizan DTOs para recibir y devolver información, excepciones personalizadas para representar errores y transacciones para proteger las operaciones que modifican datos.

## DTOs

### Solicitudes

- `CreateEventRequest`
- `PurchaseTicketRequest`
- `RegisterUserRequest`

### Respuestas

- `VenueResponse`
- `ArtistResponse`
- `EventResponse`
- `EventSummaryResponse`
- `UserResponse`
- `TicketResponse`
- `ErrorResponse`

Los DTOs están implementados mediante `record` y permiten separar la representación pública de la API de las entidades de persistencia.

## API REST

La API expone un total de 20 endpoints organizados en cinco controladores.

### VenueController

| Método | Endpoint | Descripción | Respuesta |
|---|---|---|---|
| `GET` | `/api/venues/{code}` | Busca un venue por su código. | `200 OK` |
| `GET` | `/api/venues/active` | Lista los venues activos. | `200 OK` |

### ArtistController

| Método | Endpoint | Descripción | Respuesta |
|---|---|---|---|
| `GET` | `/api/artists/{id}` | Busca un artista por su identificador. | `200 OK` |
| `GET` | `/api/artists/by-stage-name?stageName={stageName}` | Busca un artista por su nombre artístico. | `200 OK` |
| `GET` | `/api/artists/active` | Lista los artistas activos. | `200 OK` |

### EventController

| Método | Endpoint | Descripción | Respuesta |
|---|---|---|---|
| `POST` | `/api/events` | Crea un evento. | `201 Created` |
| `GET` | `/api/events/{eventCode}` | Busca un evento por su código. | `200 OK` |
| `GET` | `/api/events/published` | Lista los eventos publicados. | `200 OK` |
| `PATCH` | `/api/events/{eventCode}/publish` | Publica un evento. | `200 OK` |
| `POST` | `/api/events/{eventCode}/artists/{artistId}` | Agrega un artista a un evento. | `200 OK` |
| `GET` | `/api/events/by-artist?stageName={stageName}` | Busca eventos por nombre artístico. | `200 OK` |

### UserController

| Método | Endpoint | Descripción | Respuesta |
|---|---|---|---|
| `POST` | `/api/users` | Registra un usuario. | `201 Created` |
| `GET` | `/api/users/by-email?email={email}` | Busca un usuario por su correo electrónico. | `200 OK` |
| `GET` | `/api/users/by-username?username={username}` | Busca un usuario por su nombre de usuario. | `200 OK` |

### TicketController

| Método | Endpoint | Descripción | Respuesta |
|---|---|---|---|
| `POST` | `/api/tickets` | Compra un ticket. | `201 Created` |
| `GET` | `/api/tickets/{ticketCode}` | Busca un ticket por su código. | `200 OK` |
| `GET` | `/api/tickets/by-user?email={email}` | Lista los tickets de un usuario. | `200 OK` |
| `GET` | `/api/events/{eventCode}/tickets/paid` | Lista los tickets pagados de un evento. | `200 OK` |
| `PATCH` | `/api/tickets/{ticketCode}/cancel` | Cancela un ticket. | `200 OK` |
| `PATCH` | `/api/tickets/{ticketCode}/use` | Marca un ticket como usado. | `200 OK` |

## Validación de solicitudes

Los cuerpos recibidos por los endpoints de creación utilizan `@Valid` y restricciones de Jakarta Bean Validation.

Entre las validaciones implementadas se encuentran:

- Campos obligatorios mediante `@NotBlank` y `@NotNull`.
- Validación del formato del correo mediante `@Email`.
- Validación de códigos y datos necesarios para crear eventos.
- Validación de los datos requeridos para comprar tickets.
- Validación de los datos necesarios para registrar usuarios.

Cuando una solicitud no cumple las restricciones, la API devuelve `400 Bad Request` y no ejecuta el método correspondiente del servicio.

## Manejo global de errores

La clase `GlobalExceptionHandler`, anotada con `@RestControllerAdvice`, centraliza el manejo de errores de la API.

| Situación | Estado HTTP |
|---|---|
| Solicitud inválida | `400 Bad Request` |
| JSON mal formado | `400 Bad Request` |
| Recurso inexistente | `404 Not Found` |
| Recurso duplicado | `409 Conflict` |
| Incumplimiento de una regla de negocio | `409 Conflict` |
| Error inesperado | `500 Internal Server Error` |

Las respuestas de error utilizan una estructura uniforme mediante `ErrorResponse`:

```json
{
  "timestamp": "2026-10-09T21:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found",
  "details": {}
}
```

## Pruebas

### Pruebas de persistencia

Las pruebas de integración utilizan una instancia real y temporal de PostgreSQL creada mediante Testcontainers.

Estas pruebas verifican:

- Aplicación correcta de las migraciones Flyway.
- Validación del esquema por Hibernate.
- Persistencia y búsqueda de entidades.
- Relaciones entre venues, eventos, artistas, usuarios, perfiles y tickets.
- Consultas derivadas de Spring Data.
- Consultas JPQL con `JOIN`, `DISTINCT` y `COUNT`.
- Restricciones de unicidad e integridad.
- Rechazo de capacidades no positivas.
- Rechazo de precios negativos.
- Rechazo de un segundo perfil para el mismo usuario.

### Pruebas de servicios

Las pruebas unitarias de los servicios utilizan JUnit 5, Mockito y AssertJ.

Estas pruebas verifican:

- Resultados exitosos.
- Recursos inexistentes.
- Recursos duplicados.
- Reglas de negocio.
- Cambios de estado.
- Interacciones con repositories y mappers.
- Excepciones esperadas.

### Pruebas de controladores

Las pruebas de los controladores utilizan `@WebMvcTest`, `MockMvc` y `@MockitoBean`.

Se implementaron:

| Clase de prueba | Cantidad |
|---|---:|
| `VenueControllerTest` | 3 |
| `ArtistControllerTest` | 4 |
| `EventControllerTest` | 9 |
| `UserControllerTest` | 5 |
| `TicketControllerTest` | 11 |
| **Total de pruebas de controladores** | **32** |

Estas pruebas verifican:

- Estado HTTP de la respuesta.
- Tipo de contenido JSON.
- Contenido de la respuesta mediante `jsonPath`.
- Validación de solicitudes incorrectas.
- Manejo de recursos inexistentes.
- Manejo de recursos duplicados.
- Manejo de reglas de negocio.
- Invocación correcta de los servicios mediante `verify`.
- Ausencia de llamadas al servicio cuando la solicitud es inválida mediante `verify(..., never())`.

### Resultado general

La ejecución completa del proyecto obtuvo:

```text
Tests run: 93, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

## Configuración de la base de datos

La aplicación utiliza las siguientes variables de entorno:

- `DB_URL`
- `DB_USER`
- `DB_PASSWORD`

Si no se configuran, se utilizan los valores locales definidos en `application.yaml`:

```text
URL: jdbc:postgresql://localhost:5432/pulsepass
Usuario: postgres
Contraseña: postgres
```

Durante las pruebas de integración, Testcontainers crea automáticamente una instancia temporal de PostgreSQL. Por esta razón, no es necesario crear manualmente una base de datos para ejecutar las pruebas.

## Ejecución del proyecto

### Requisitos

- Java 21
- Docker Desktop en ejecución
- Maven Wrapper incluido en el proyecto

### Ejecutar todas las pruebas en Windows

```powershell
.\mvnw.cmd clean test
```

### Compilar sin ejecutar las pruebas

```powershell
.\mvnw.cmd -DskipTests compile
```

### Ejecutar la aplicación en Windows

```powershell
.\mvnw.cmd spring-boot:run
```

### Ejecutar las pruebas en Linux o macOS

```bash
./mvnw clean test
```

## Respuestas a las preguntas de la capa de controladores

### 1. ¿Cuál es la responsabilidad de un Controller y cuál es la responsabilidad de un Service?

Un Controller recibe solicitudes HTTP, obtiene los parámetros, valida la estructura de los datos de entrada, llama al servicio correspondiente y construye la respuesta HTTP.

Un Service implementa las reglas de negocio, coordina las operaciones necesarias y administra las transacciones. Esta separación permite que cada capa tenga una responsabilidad clara.

### 2. ¿Por qué un Controller no debe acceder directamente a un Repository?

Porque el Controller debe encargarse únicamente de la comunicación HTTP. Si accediera directamente al Repository, las reglas de negocio quedarían mezcladas con la capa web y sería más difícil mantener, probar y reutilizar el código.

Por esta razón, los controladores de PulsePass dependen de interfaces Service y no utilizan repositories directamente.

### 3. ¿Cuál es la diferencia entre una validación estructural y una regla de negocio?

Una validación estructural comprueba que la solicitud tenga el formato requerido. Por ejemplo, verifica que un campo obligatorio no esté vacío o que un correo tenga un formato válido. Estas validaciones se realizan mediante Jakarta Bean Validation.

Una regla de negocio depende del estado y las condiciones propias del sistema. Por ejemplo, impedir la publicación de un evento inválido, evitar registros duplicados o controlar los cambios de estado de un ticket. Estas reglas pertenecen a la capa Service.

### 4. ¿Cuándo debe responder la API con 400, 404 o 409?

La API responde con `400 Bad Request` cuando la solicitud tiene datos inválidos o contiene un JSON mal formado.

Responde con `404 Not Found` cuando el recurso solicitado no existe.

Responde con `409 Conflict` cuando existe un conflicto con el estado actual del sistema, como un recurso duplicado o el incumplimiento de una regla de negocio.

### 5. ¿Por qué las operaciones de creación responden con 201 en lugar de 200?

El estado `201 Created` indica específicamente que la solicitud fue procesada correctamente y produjo la creación de un nuevo recurso.

Por esta razón, la creación de eventos, el registro de usuarios y la compra de tickets devuelven `201 Created`. Las consultas y actualizaciones que se completan correctamente devuelven `200 OK`.

### 6. ¿Por qué es conveniente utilizar una estructura uniforme para los errores?

Una estructura uniforme permite que los clientes de la API interpreten los errores de manera predecible. También facilita las pruebas, la depuración y la presentación de mensajes claros.

En PulsePass, `ErrorResponse` incluye la fecha y hora, el código de estado, el tipo de error, el mensaje y los detalles de validación.

## Resultado

PulsePass implementa correctamente las capas de persistencia, servicios y controladores REST solicitadas.

El proyecto contiene:

- Cinco controladores REST.
- Veinte endpoints.
- DTOs de solicitud y respuesta.
- Validación de solicitudes.
- Manejo global y uniforme de errores.
- Servicios transaccionales.
- Repositories con Query Methods y JPQL.
- Migraciones con Flyway.
- Pruebas de integración con PostgreSQL y Testcontainers.
- Pruebas unitarias de servicios.
- Treinta y dos pruebas de controladores con MockMvc.

La ejecución final completó **93 pruebas sin fallos ni errores**.