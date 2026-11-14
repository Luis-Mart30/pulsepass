# PulsePass

Sistema académico para la gestión de eventos, artistas, escenarios, usuarios y entradas, desarrollado con Java, Spring Boot y PostgreSQL.

## Integrantes

- Luis Jaime Martínez Monsalvo — Código: 2023214025
- Angelica Sierra Zapata — Código: 2023214030

## Tecnologías

- Java 21
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- Spring Security
- JJWT
- PostgreSQL
- Flyway
- MapStruct
- Maven
- Docker
- Testcontainers
- JUnit 5
- Mockito
- AssertJ
- MockMvc

## Capas implementadas

El proyecto contiene:

- Capa de persistencia.
- Capa de servicios.
- Capa de controladores REST.
- Capa de seguridad.
- Validación de solicitudes.
- Manejo uniforme de errores.
- Pruebas unitarias.
- Pruebas HTTP con MockMvc.
- Pruebas de integración con PostgreSQL real mediante Testcontainers.

## Modelo de dominio

El modelo contiene las siguientes entidades:

- `Venue`: escenario donde se realiza un evento.
- `Event`: información de un evento.
- `Artist`: artista que puede participar en eventos.
- `User`: información principal del usuario.
- `UserProfile`: información personal del usuario.
- `Ticket`: entrada adquirida para un evento.
- `UserCredential`: hash de la contraseña del usuario.
- `UserRole`: rol asignado a un usuario.

## Relaciones principales

- Un `Venue` puede tener varios eventos.
- Un `Event` pertenece a un `Venue`.
- Un `Event` puede tener varios artistas.
- Un `Artist` puede participar en varios eventos.
- Un `User` tiene un perfil.
- Un `User` puede tener varios tickets.
- Un `Ticket` pertenece a un usuario y un evento.
- Un `UserCredential` pertenece a un usuario.
- Un usuario puede tener uno o varios roles persistidos.

## Migraciones Flyway

### V1__create_schema.sql

Crea las tablas principales:

- `venues`
- `events`
- `artists`
- `event_artists`
- `users`
- `user_profiles`
- `tickets`

### V2__insert_initial_artists.sql

Inserta los artistas iniciales del sistema.

### V3__add_streaming_url_to_event.sql

Agrega la columna opcional `streaming_url` a los eventos.

### V4__security_credentials_roles.sql

Agrega las tablas de seguridad:

- `user_credentials`
- `user_roles`

La migración incluye:

- Claves primarias.
- Claves foráneas.
- Eliminación en cascada.
- Restricción de roles válidos.
- Unicidad de cada combinación de usuario y rol.

## Seguridad

La seguridad está implementada mediante Spring Security y JWT firmado con JJWT.

Características principales:

- Autenticación sin estado.
- Sin sesiones HTTP.
- Sin autenticación básica.
- Sin formulario de inicio de sesión.
- Protección CSRF deshabilitada para la API REST stateless.
- Contraseñas protegidas con BCrypt.
- JWT firmado exclusivamente con HS256.
- Clave JWT suministrada mediante variable de entorno.
- Duración configurable.
- Emisor configurable.
- Identificador único `jti`.
- Validación de `sub`, `iss`, `iat`, `exp` y `jti`.
- Recarga del usuario y sus roles desde PostgreSQL en cada solicitud autenticada.
- Rechazo inmediato de usuarios desactivados.
- Respuestas JSON uniformes para `401` y `403`.
- Protección contra acceso a recursos pertenecientes a otros usuarios.
- CORS configurable mediante variable de entorno.
- Identificador único por solicitud en `X-Request-ID`.
- Registro seguro de accesos denegados y autenticaciones.
- No se registran contraseñas, hashes ni tokens.

## Roles

### USER

Puede:

- Comprar tickets para su propia cuenta.
- Consultar sus propios tickets.
- Cancelar sus propios tickets.
- Consultar sus propios datos.

No puede:

- Crear o publicar eventos.
- Usar tickets.
- Consultar información privada de otros usuarios.
- Comprar tickets utilizando el correo de otro usuario.

### STAFF

Puede:

- Consultar tickets pagados de un evento.
- Marcar tickets como usados.
- Consultar eventos no publicados cuando la operación lo permita.

No obtiene automáticamente propiedad sobre datos personales de otros usuarios.

### ADMIN

Puede:

- Crear eventos.
- Publicar eventos.
- Asociar artistas a eventos.
- Consultar tickets pagados.
- Marcar tickets como usados.
- Consultar información expresamente autorizada.
- Cancelar tickets cuando la regla de autorización lo permita.

## Autenticación

### Registrar usuario

```http
POST /api/users
Content-Type: application/json
```

Ejemplo:

```json
{
  "username": "andrea",
  "email": "andrea@example.com",
  "password": "UnaClaveSegura2026!",
  "firstName": "Andrea",
  "lastName": "Martinez",
  "phone": "3001234567",
  "city": "Santa Marta",
  "birthDate": "2000-05-10"
}
```

El registro:

1. Crea el usuario y su perfil.
2. Genera un hash BCrypt de la contraseña.
3. Guarda las credenciales.
4. Asigna exclusivamente el rol inicial `USER`.
5. Ejecuta todo el proceso dentro de una transacción.

El registro no devuelve contraseña, hash ni JWT.

### Iniciar sesión

```http
POST /api/auth/login
Content-Type: application/json
```

Ejemplo:

```json
{
  "identifier": "andrea",
  "password": "UnaClaveSegura2026!"
}
```

También es posible utilizar el correo como identificador.

Respuesta:

```json
{
  "accessToken": "JWT_FIRMADO",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

Cuando las credenciales son incorrectas, la API devuelve un mensaje genérico y no indica si el usuario existe.

### Consultar identidad autenticada

```http
GET /api/auth/me
Authorization: Bearer JWT_FIRMADO
```

La respuesta contiene:

- ID del usuario.
- Nombre de usuario.
- Correo.
- Roles vigentes.

No contiene contraseña ni hash.

## Matriz de autorización

| Método | Ruta | Anónimo | USER | STAFF | ADMIN |
|---|---|---:|---:|---:|---:|
| GET | `/api/venues/{code}` | Permitido | Permitido | Permitido | Permitido |
| GET | `/api/venues/active` | Permitido | Permitido | Permitido | Permitido |
| POST | `/api/events` | 401 | 403 | 403 | Permitido |
| GET | `/api/events/{eventCode}` | Solo publicado | Solo publicado | Permitido | Permitido |
| GET | `/api/events/published` | Permitido | Permitido | Permitido | Permitido |
| PATCH | `/api/events/{eventCode}/publish` | 401 | 403 | 403 | Permitido |
| POST | `/api/events/{eventCode}/artists/{artistId}` | 401 | 403 | 403 | Permitido |
| GET | `/api/events/by-artist` | Solo publicados | Solo publicados | Permitido | Permitido |
| GET | `/api/artists/{id}` | Permitido | Permitido | Permitido | Permitido |
| GET | `/api/artists/by-stage-name` | Permitido | Permitido | Permitido | Permitido |
| GET | `/api/artists/active` | Permitido | Permitido | Permitido | Permitido |
| POST | `/api/users` | Permitido | Permitido | Permitido | Permitido |
| GET | `/api/users/by-email` | 401 | Propio usuario | 403 | Permitido |
| GET | `/api/users/by-username` | 401 | Propio usuario | 403 | Permitido |
| POST | `/api/tickets` | 401 | Correo propio | 403 | 403 |
| GET | `/api/tickets/{ticketCode}` | 401 | Ticket propio | Permitido | Permitido |
| GET | `/api/tickets/by-user` | 401 | Correo propio | 403 | Permitido |
| GET | `/api/events/{eventCode}/tickets/paid` | 401 | 403 | Permitido | Permitido |
| PATCH | `/api/tickets/{ticketCode}/cancel` | 401 | Ticket propio | 403 | Permitido |
| PATCH | `/api/tickets/{ticketCode}/use` | 401 | 403 | Permitido | Permitido |

## Protección contra IDOR

Las comprobaciones de propiedad no confían únicamente en el correo o código recibido en la solicitud.

El sistema consulta PostgreSQL para comprobar:

- ID persistido del usuario autenticado.
- ID del propietario del ticket.
- Usuario asociado al correo solicitado.
- Usuario asociado al nombre de usuario solicitado.

Esto evita que un usuario modifique el correo o código enviado para acceder a información de otra persona.

## Estados HTTP de seguridad

### 401 Unauthorized

Se utiliza cuando:

- No existe autenticación.
- Falta el token.
- El token está alterado.
- El token está vencido.
- El token no tiene claims obligatorios.
- El emisor es incorrecto.
- El usuario está inactivo.
- Las credenciales son incorrectas.

### 403 Forbidden

Se utiliza cuando existe una identidad válida, pero no tiene permiso para realizar la operación.

Ejemplos:

- Un `USER` intenta crear un evento.
- Un `USER` intenta utilizar un ticket.
- Un usuario consulta un ticket ajeno.
- Un usuario compra usando un correo ajeno.
- Un usuario consulta los datos privados de otra persona.

## ErrorResponse

Los errores mantienen una estructura uniforme:

```json
{
  "timestamp": "2026-10-14T13:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "You do not have permission to access this resource",
  "details": {}
}
```

Los errores no incluyen:

- Stacktrace.
- Contraseñas.
- Hashes BCrypt.
- Tokens JWT.
- Información interna de autenticación.

## Variables de entorno

El proyecto utiliza:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_URL` | URL de PostgreSQL | `jdbc:postgresql://localhost:5432/pulsepass` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `change-me` |
| `PULSEPASS_JWT_ISSUER` | Emisor del JWT | `pulsepass-api` |
| `PULSEPASS_JWT_SECRET_BASE64` | Clave Base64 de mínimo 32 bytes | Sin valor predeterminado |
| `PULSEPASS_JWT_ACCESS_TOKEN_TTL` | Duración del JWT | `PT15M` |
| `PULSEPASS_CORS_ALLOWED_ORIGINS` | Orígenes CORS permitidos | `http://localhost:3000` |

El archivo `.env.example` contiene únicamente valores de ejemplo. No deben guardarse secretos reales en Git.

## Generar una clave JWT en PowerShell

```powershell
$jwtBytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($jwtBytes)
$env:PULSEPASS_JWT_SECRET_BASE64 = [Convert]::ToBase64String($jwtBytes)
$rng.Dispose()
```

Comprobar la clave:

```powershell
[Convert]::FromBase64String(
    $env:PULSEPASS_JWT_SECRET_BASE64
).Length
```

El resultado debe ser:

```text
32
```

La variable solo queda activa en la terminal actual.

## Configuración CORS

El origen permitido se configura mediante:

```text
PULSEPASS_CORS_ALLOWED_ORIGINS
```

Valor local predeterminado:

```text
http://localhost:3000
```

Para varios orígenes se utiliza una lista separada por comas:

```text
http://localhost:3000,http://localhost:5173
```

En producción deben utilizarse exclusivamente orígenes conocidos y HTTPS.

## Trazabilidad

Cada solicitud recibe el encabezado:

```text
X-Request-ID
```

Este identificador se utiliza en los registros de:

- Autenticación exitosa.
- Autenticación fallida.
- Solicitudes sin autenticación.
- Solicitudes con permisos insuficientes.

No se registran credenciales ni tokens.

## Ejecución

### Requisitos

- Java 21.
- Docker Desktop.
- PostgreSQL para ejecutar la aplicación.
- Maven Wrapper incluido.

### Windows PowerShell

Definir la clave JWT:

```powershell
$jwtBytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($jwtBytes)
$env:PULSEPASS_JWT_SECRET_BASE64 = [Convert]::ToBase64String($jwtBytes)
$rng.Dispose()
```

Ejecutar pruebas:

```powershell
.\mvnw.cmd clean test
```

Ejecutar la aplicación:

```powershell
.\mvnw.cmd spring-boot:run
```

### Linux o macOS

```bash
export PULSEPASS_JWT_SECRET_BASE64="$(
  openssl rand -base64 32
)"
./mvnw clean test
```

## Pruebas

El proyecto incluye:

- Pruebas de repositories.
- Pruebas de servicios.
- Pruebas de controladores.
- Pruebas de validación.
- Pruebas de JWT.
- Pruebas del filtro Bearer.
- Pruebas de roles.
- Pruebas de propiedad.
- Pruebas de respuestas `401` y `403`.
- Pruebas de usuario inactivo.
- Pruebas de JWT alterado y vencido.
- Pruebas de registro transaccional.
- Pruebas de BCrypt.
- Pruebas de login contra PostgreSQL.
- Pruebas de rollback.
- Pruebas de integración con Testcontainers.

Último resultado completo verificado:

```text
Tests run: 177, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

## Comandos de verificación

Compilar:

```powershell
.\mvnw.cmd "-DskipTests" clean compile
```

Ejecutar todas las pruebas:

```powershell
.\mvnw.cmd clean test
```

Comprobar formato de Git:

```powershell
git diff --check
```

Consultar estado:

```powershell
git status
```

## Limitaciones del MVP académico

No forman parte del alcance actual:

- Refresh tokens.
- Cierre de sesión con lista de revocación.
- Rotación automática de claves.
- Autenticación multifactor.
- Recuperación de contraseña.
- Pasarela de pagos.
- Interfaz gráfica.
- Límite automático de intentos de login.
- Protección distribuida contra fuerza bruta.

Para un ambiente real también deben utilizarse:

- HTTPS.
- Gestor de secretos.
- Monitoreo centralizado.
- Rotación periódica de claves.
- Rate limiting.
- Auditoría persistente.
- Orígenes CORS explícitos.

## Resultado

PulsePass implementa persistencia, servicios, controladores REST y seguridad stateless mediante Spring Security y JWT.

La aplicación protege las 20 operaciones heredadas utilizando autenticación, roles y propiedad de los recursos. Las credenciales se almacenan mediante BCrypt, los roles se consultan desde PostgreSQL y las respuestas de seguridad conservan un formato JSON uniforme.