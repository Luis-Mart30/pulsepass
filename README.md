# PulsePass
## Integrantes

- **Luis Jaime Martínez Monsalvo** — Código: 2023214025
- **Angélica Sierra Zapata** — Código: 2023214030

PulsePass es un proyecto académico enfocado en la capa de persistencia de una plataforma de eventos y venta de entradas. Permite representar venues, eventos, artistas, usuarios, perfiles y tickets, manteniendo la integridad de los datos mediante PostgreSQL, JPA y Flyway.

## Tecnologías utilizadas

- Java 21
- Spring Boot 4
- Spring Data JPA
- Hibernate
- PostgreSQL
- Flyway
- Testcontainers
- JUnit 5
- Maven
- Docker

## Alcance del proyecto

Este proyecto implementa únicamente la capa de persistencia. No incluye API REST, interfaz gráfica, autenticación, pagos ni capa de servicios.

## Modelo de dominio

El modelo contiene las siguientes entidades:

- `Venue`: representa el lugar donde se realiza un evento.
- `Event`: almacena la información de cada evento.
- `Artist`: representa a los artistas participantes.
- `User`: contiene los datos principales de un usuario.
- `UserProfile`: almacena la información personal del usuario.
- `Ticket`: representa una entrada comprada o reservada.

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

PostgreSQL protege las principales reglas del modelo:

- Los códigos de venues, eventos y tickets son únicos.
- El nombre artístico, el nombre de usuario y el correo son únicos.
- La capacidad de un venue debe ser mayor que cero.
- El precio de un ticket no puede ser negativo.
- Un usuario no puede tener más de un perfil.
- Un ticket siempre debe estar relacionado con un usuario y un evento.
- La relación entre evento y artista no admite asociaciones duplicadas.
- Los valores enumerados se almacenan por nombre y no por posición.

## Migraciones con Flyway

El esquema se administra exclusivamente mediante Flyway.

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

Inserta los artistas iniciales:

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

La migración se creó de forma independiente para no modificar una migración que ya podría haber sido aplicada.

## Repositories

Los repositories extienden `JpaRepository` y permiten utilizar las operaciones CRUD proporcionadas por Spring Data JPA.

Se implementaron:

- `VenueRepository`
- `ArtistRepository`
- `UserRepository`
- `EventRepository`
- `TicketRepository`

## Consultas implementadas

### Query Methods

Se utilizan Query Methods para consultas sencillas y fáciles de interpretar, por ejemplo:

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

Se utiliza JPQL cuando la consulta necesita recorrer varias relaciones, aplicar filtros o realizar agregaciones:

- Buscar eventos por artista.
- Buscar eventos por ciudad y artista.
- Recomendar eventos publicados por fecha, ciudad y texto del artista.
- Contar tickets de un evento según su estado.

No se utilizó SQL nativo para implementar las consultas del taller.

## Pruebas de integración

Las pruebas utilizan PostgreSQL real mediante Testcontainers. Docker debe estar abierto antes de ejecutarlas.

Las pruebas verifican:

- Aplicación correcta de las migraciones Flyway.
- Validación del esquema por Hibernate.
- Persistencia y búsqueda de venues.
- Relación entre venues y eventos.
- Relación muchos a muchos entre eventos y artistas.
- Relación uno a uno entre usuarios y perfiles.
- Relaciones de tickets con usuarios y eventos.
- Consultas derivadas de Spring Data.
- Consultas JPQL con `JOIN`, `DISTINCT` y `COUNT`.
- Orden cronológico de eventos y tickets.
- Rechazo de códigos duplicados.
- Rechazo de precios negativos.
- Rechazo de capacidades no positivas.
- Rechazo de un segundo perfil para el mismo usuario.

El resultado final obtenido fue:

```text
Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
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

En las pruebas, Testcontainers crea automáticamente una instancia temporal de PostgreSQL, por lo que no se requiere crear manualmente una base de datos.

## Ejecución del proyecto

### Requisitos

- Java 21
- Docker Desktop
- Maven Wrapper incluido en el proyecto

### Ejecutar las pruebas en Windows

```powershell
.\mvnw.cmd clean test
```

### Compilar sin ejecutar las pruebas

```powershell
.\mvnw.cmd -DskipTests compile
```

### Ejecutar las pruebas en Linux o macOS

```bash
./mvnw clean test
```

## Respuestas a las preguntas del taller

### 1. ¿Por qué Ticket debe ser una entidad en lugar de un `@ManyToMany` entre User y Event?

Porque la relación posee información propia, como el código del ticket, tipo, precio, estado y fecha de compra. Una relación `@ManyToMany` simple solo asociaría al usuario con el evento y no permitiría representar correctamente esos datos. Además, un mismo usuario podría adquirir varios tickets para el mismo evento.

### 2. ¿Qué reglas pertenecen a PostgreSQL y cuáles deberían quedar para una futura capa Service?

PostgreSQL debe proteger las reglas que siempre deben cumplirse, como claves foráneas, campos obligatorios, valores únicos, capacidad mayor que cero, precio no negativo y un solo perfil por usuario.

Una futura capa Service debería manejar reglas que necesitan un proceso de negocio, como verificar disponibilidad, evitar sobreventa, cambiar estados de manera controlada, calcular cuándo un evento está agotado, procesar pagos o cancelar una compra.

### 3. ¿Qué consultas pueden expresarse claramente como Query Methods y cuáles justifican JPQL?

Los Query Methods son apropiados para búsquedas sencillas, como consultar por código, correo, estado o navegar una relación directa.

JPQL se justifica cuando se necesitan varios `JOIN`, filtros combinados, `DISTINCT`, ordenamientos especiales o funciones de agregación como `COUNT`. Por eso las búsquedas por artista, ciudad y recomendaciones utilizan JPQL.

### 4. ¿Qué consecuencias tendría modificar V1 después de haberla aplicado en un ambiente compartido?

Flyway guarda el historial y el checksum de cada migración aplicada. Si se modifica V1 después de ejecutarla, Flyway detectará que el archivo ya no coincide con el registrado y puede detener el inicio de la aplicación.

También podrían quedar ambientes con estructuras diferentes. La forma correcta de realizar un cambio es crear una nueva migración, como se hizo con V3 para agregar `streaming_url`.

### 5. ¿Qué diferencias podría ocultar una prueba con H2 frente a PostgreSQL?

H2 y PostgreSQL tienen diferencias en tipos de datos, restricciones, funciones, sensibilidad a mayúsculas, dialecto SQL y comportamiento transaccional. Una prueba podría funcionar con H2 y fallar al utilizar PostgreSQL.

Por esta razón, las pruebas utilizan Testcontainers con PostgreSQL real y validan el mismo comportamiento esperado en producción.

### 6. ¿Cómo evolucionaría el modelo para soportar inventario de tickets y evitar sobreventa?

Se podría agregar una entidad de inventario relacionada con el evento, el tipo de ticket o una sección del venue. Esta entidad almacenaría la cantidad total, reservada y vendida.

La compra tendría que ejecutarse dentro de una transacción y usar bloqueo optimista o pesimista para impedir que dos usuarios compren el último ticket al mismo tiempo. También podrían incorporarse entidades como `Order`, `Payment`, `TicketSection` y reservas con tiempo de expiración.

## Resultado

El proyecto cumple con el modelo relacional solicitado, las migraciones Flyway, los repositories, las consultas requeridas y las pruebas de integración ejecutadas sobre PostgreSQL mediante Testcontainers.