# Pruebas E2E manuales de PulsePass

Este directorio contiene los artefactos utilizados para verificar manualmente la API REST de PulsePass mediante Postman.

La ejecución atraviesa el sistema completo:

Postman → Spring Security → controladores → servicios → repositorios → PostgreSQL.

Durante las pruebas E2E no se utilizan mocks.

## Alcance

La colección debe cubrir las 22 rutas previstas:

- 20 operaciones de negocio heredadas.
- `POST /api/auth/login`.
- `GET /api/auth/me`.

También debe comprobar:

- Consultas públicas de venues, artistas y eventos.
- Registro de USER_A y USER_B.
- Login mediante username y email.
- Autenticación mediante JWT.
- Autorización para USER, STAFF y ADMIN.
- Acceso anónimo.
- Usuario inactivo.
- Propiedad y aislamiento de recursos.
- Compra, consulta, cancelación y uso de tickets.
- Persistencia posterior a operaciones permitidas.
- Ausencia de mutación posterior a operaciones denegadas.
- Respuestas HTTP 200, 201, 400, 401, 403, 404 y 409.
- Contrato uniforme de `ErrorResponse`.
- Ausencia de respuestas HTTP 500.

## Estructura

```text
tests/e2e/
|-- .gitignore
|-- README.md
|-- checklist-e2e-manual.md
|-- registro-ejecucion-manual.md
|-- fixtures/
|   |-- README.md
|   `-- seed-e2e.sql
`-- postman/
    |-- PulsePass-Manual-E2E.postman_collection.json
    `-- PulsePass-local.postman_environment.json
```

## Requisitos previos

- Java 21.
- Docker Desktop en ejecución.
- PostgreSQL 16 mediante Docker.
- Postman Desktop.
- Puerto 5433 disponible para PostgreSQL.
- Puerto 8080 disponible para PulsePass.
- Base de datos exclusiva `pulsepass_e2e`.
- Rama de trabajo actualizada.

Las pruebas nunca deben ejecutarse sobre una base de desarrollo, QA o producción.

## Preparar PostgreSQL E2E

Comprobar Docker:

```powershell
docker version
docker ps -a
```

Crear o iniciar el contenedor exclusivo:

```powershell
$nombreContenedor = "pulsepass-e2e-db"

$contenedorExiste = docker ps -a `
    --filter "name=^/$nombreContenedor$" `
    --format "{{.Names}}"

if (
    [string]::IsNullOrWhiteSpace(
        $contenedorExiste
    )
) {
    docker run `
        --name $nombreContenedor `
        -e POSTGRES_DB=pulsepass_e2e `
        -e POSTGRES_USER=pulsepass_e2e `
        -e POSTGRES_PASSWORD=pulsepass_e2e_local `
        -p 5433:5432 `
        -d postgres:16-alpine
} else {
    docker start $nombreContenedor
}

docker exec pulsepass-e2e-db `
    pg_isready `
    -U pulsepass_e2e `
    -d pulsepass_e2e
```

El resultado debe indicar `accepting connections`.

## Configurar la aplicación

En la terminal donde se iniciará PulsePass:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5433/pulsepass_e2e"
$env:DB_USER = "pulsepass_e2e"
$env:DB_PASSWORD = "pulsepass_e2e_local"

$jwtBytes = New-Object byte[] 32

$generador = `
    [System.Security.Cryptography.RandomNumberGenerator]::Create()

try {
    $generador.GetBytes($jwtBytes)
} finally {
    $generador.Dispose()
}

$env:PULSEPASS_JWT_SECRET_BASE64 = `
    [Convert]::ToBase64String($jwtBytes)

[Convert]::FromBase64String(
    $env:PULSEPASS_JWT_SECRET_BASE64
).Length
```

El último comando debe mostrar `32`.

El secreto JWT es exclusivamente local. No debe copiarse a Postman, capturas, documentos ni Git.

## Aplicar migraciones

Iniciar PulsePass:

```powershell
.\mvnw.cmd spring-boot:run
```

Mantener esa terminal abierta.

Desde otra terminal, comprobar Flyway:

```powershell
docker exec pulsepass-e2e-db `
    psql `
    -U pulsepass_e2e `
    -d pulsepass_e2e `
    -c "SELECT installed_rank, version, description, success FROM flyway_schema_history ORDER BY installed_rank;"
```

Todas las migraciones deben tener `success = t`.

## Cargar los fixtures

Copiar el seed:

```powershell
docker cp `
    tests/e2e/fixtures/seed-e2e.sql `
    pulsepass-e2e-db:/tmp/seed-e2e.sql
```

Ejecutarlo con contraseñas locales:

```powershell
$adminPasswordSecure = Read-Host "Contraseña local de ADMIN" -AsSecureString
$staffPasswordSecure = Read-Host "Contraseña local de STAFF" -AsSecureString
$inactivePasswordSecure = Read-Host "Contraseña local del usuario inactivo" -AsSecureString

$adminPassword = [System.Net.NetworkCredential]::new("", $adminPasswordSecure).Password
$staffPassword = [System.Net.NetworkCredential]::new("", $staffPasswordSecure).Password
$inactivePassword = [System.Net.NetworkCredential]::new("", $inactivePasswordSecure).Password

docker exec pulsepass-e2e-db `
    psql `
    -U pulsepass_e2e `
    -d pulsepass_e2e `
    -v "admin_password=$adminPassword" `
    -v "staff_password=$staffPassword" `
    -v "inactive_password=$inactivePassword" `
    -f /tmp/seed-e2e.sql
```

Estas contraseñas son exclusivamente locales. Deben introducirse manualmente en Postman y nunca exportarse.

Después de cargar el seed:

```powershell
Remove-Variable adminPassword
Remove-Variable staffPassword
Remove-Variable inactivePassword
Remove-Variable adminPasswordSecure
Remove-Variable staffPasswordSecure
Remove-Variable inactivePasswordSecure
```

## Importar en Postman

Importar:

1. `postman/PulsePass-Manual-E2E.postman_collection.json`.
2. `postman/PulsePass-local.postman_environment.json`.

Seleccionar el ambiente `PulsePass Local E2E`.

Completar únicamente en valores locales:

- `adminPassword`
- `staffPassword`
- `inactivePassword`
- `userAPassword`
- `userBPassword`
- `roleInjectionPassword`

Después de cada login, copiar manualmente `accessToken` a:

- `adminToken`
- `staffToken`
- `userAToken`
- `userBToken`
- `roleInjectionToken`

No exportar tokens ni contraseñas.

## Orden manual de ejecución

Ejecutar las carpetas en este orden:

1. `00 Preparación / conectividad`.
2. `01 Venues`.
3. `02 Artists`.
4. `03 Auth / usuarios`.
5. `04 Usuarios / consulta y propiedad`.
6. `05 Events / administración y visibilidad`.
7. `06 Tickets / compra, consulta y ciclo de vida`.
8. `07 Seguridad / escenarios negativos`.
9. `08 Validaciones y errores HTTP`.
10. `09 Flujos de negocio / secuencia recomendada`.

Cada request se ejecuta individualmente con **Send**.

No utilizar:

- Collection Runner.
- Newman.
- Postman CLI.
- Pre-request Scripts.
- Post-response Scripts.
- `pm.test`.
- `pm.expect`.

## Verificación de respuestas exitosas

Para cada respuesta exitosa revisar:

- Código HTTP exacto.
- `Content-Type: application/json`.
- JSON correctamente formado.
- Campos del DTO real.
- Identidad y relaciones del recurso.
- Estado persistido mediante una consulta posterior.
- Ausencia de contraseñas, hashes, JWT y secretos.

Un código HTTP 2xx por sí solo no representa PASS.

## Verificación de ErrorResponse

Para respuestas 400, 401, 403, 404 y 409 comprobar:

```json
{
  "timestamp": "<fecha-hora>",
  "status": 403,
  "error": "<descripción>",
  "message": "<mensaje seguro>",
  "details": {}
}
```

También verificar:

- `status` coincide con el HTTP.
- No existe stack trace.
- No aparecen contraseñas.
- No aparecen hashes BCrypt.
- No aparecen JWT.
- No aparecen secretos.
- No se exponen entidades internas.

## Propiedad y ausencia de mutación

Cuando USER_B intente modificar un recurso de USER_A:

1. Ejecutar la operación con USER_B.
2. Comprobar el estado de denegación documentado.
3. Volver a consultar el recurso con un actor autorizado.
4. Confirmar que propietario y estado no cambiaron.
5. Registrar ambas solicitudes.

Un 403 aislado no demuestra ausencia de mutación.

## Operaciones irreversibles

Utilizar tickets diferentes:

- `ticketCancelableCode` para cancelación.
- `ticketUsableCode` para uso.

No marcar como usado un ticket cancelado.

Después de cancelar o usar un ticket, realizar un GET y comprobar el estado persistido.

## Tokens vencidos

Si un JWT vence:

1. Repetir el login.
2. Copiar el nuevo `accessToken`.
3. Reemplazar el valor local del actor.
4. Repetir la solicitud afectada.
5. Registrar la incidencia.

## Registro de resultados

Cada caso debe registrar:

- ID.
- Fecha y hora.
- Actor.
- Método y ruta.
- Datos no sensibles.
- HTTP esperado.
- HTTP observado.
- JSON o estado observado.
- Resultado.
- Observación o evidencia.

Estados:

- `PASS`: HTTP, JSON y condición funcional coinciden.
- `FAIL`: alguna condición no coincide o aparece un 500.
- `BLOCKED`: falta una precondición indispensable.
- `NOT RUN`: todavía no se ha ejecutado.

Nunca debe marcarse PASS un caso que no fue ejecutado completamente.

## Repetición desde datos limpios

La estrategia más segura es recrear exclusivamente el contenedor E2E.

Primero comprobar el nombre:

```powershell
$nombreContenedor = "pulsepass-e2e-db"

if ($nombreContenedor -ne "pulsepass-e2e-db") {
    throw "Nombre de contenedor no permitido."
}

docker ps -a `
    --filter "name=^/$nombreContenedor$"
```

Después de confirmar visualmente el contenedor correcto:

```powershell
docker rm `
    -f `
    pulsepass-e2e-db
```

Luego repetir la preparación de PostgreSQL, las migraciones y los fixtures.

Nunca adaptar este procedimiento para eliminar bases de desarrollo, QA o producción.

## Seguridad de evidencias

Las capturas y documentos no deben mostrar:

- JWT completos.
- Contraseñas.
- Secreto de firma.
- Hashes BCrypt.
- Credenciales privadas.
- Información personal real.

Los usuarios E2E utilizan el dominio reservado `example.test`.

## Archivos de resultados

- `checklist-e2e-manual.md`: cobertura y trazabilidad.
- `registro-ejecucion-manual.md`: resultado individual de cada caso.

La ejecución solo puede declararse aprobada cuando:

- Las 22 rutas están cubiertas.
- Los casos mínimos fueron ejecutados.
- No existen FAIL.
- Los BLOCKED y NOT RUN están justificados.
- No existen respuestas HTTP 500.
- No se exportaron secretos.

<!-- GUIA_E2E_COMPLEMENTO_INICIO -->

## Matriz de cobertura de las 22 rutas

| # | Método | Ruta | Acceso o regla principal |
|---:|---|---|---|
| 1 | GET | /api/venues/{code} | Público |
| 2 | GET | /api/venues/active | Público |
| 3 | GET | /api/artists/{id} | Público |
| 4 | GET | /api/artists/by-stage-name | Público |
| 5 | GET | /api/artists/active | Público |
| 6 | POST | /api/users | Público; asigna USER |
| 7 | GET | /api/users/by-email | Propietario o ADMIN |
| 8 | GET | /api/users/by-username | Propietario o ADMIN |
| 9 | POST | /api/events | ADMIN |
| 10 | GET | /api/events/{eventCode} | Público si está publicado; STAFF o ADMIN para borradores |
| 11 | GET | /api/events/published | Público |
| 12 | PATCH | /api/events/{eventCode}/publish | ADMIN |
| 13 | POST | /api/events/{eventCode}/artists/{artistId} | ADMIN |
| 14 | GET | /api/events/by-artist | Público para eventos publicados |
| 15 | POST | /api/tickets | USER para su propio correo |
| 16 | GET | /api/tickets/{ticketCode} | Propietario, STAFF o ADMIN |
| 17 | GET | /api/tickets/by-user | Propietario o ADMIN |
| 18 | GET | /api/events/{eventCode}/tickets/paid | STAFF o ADMIN |
| 19 | PATCH | /api/tickets/{ticketCode}/cancel | Propietario USER o ADMIN |
| 20 | PATCH | /api/tickets/{ticketCode}/use | STAFF o ADMIN |
| 21 | POST | /api/auth/login | Público |
| 22 | GET | /api/auth/me | Usuario autenticado y activo |

## Variables exigidas para la ejecución

- baseUrl y runId.
- userAEmail, userAUsername, userBEmail y userBUsername.
- userAPassword y userBPassword únicamente como secretos locales.
- adminIdentifier y staffIdentifier.
- adminPassword y staffPassword únicamente como secretos locales.
- userAToken, userBToken, adminToken y staffToken únicamente como secretos locales.
- venueActiveCode, artistId y artistStageName.
- publishedEventCode, draftEventCode y eventToPublishCode.
- ticketCancelableCode y ticketUsableCode.
- expectedIssuer, expectedTokenTtlSeconds y expectedForeignResourceStatus.

Las contraseñas y los JWT permanecen vacíos en el entorno exportado y solo se completan localmente en Postman.

## Procedimiento de casos de seguridad con cambio de estado

### TC-SEC-006

USER_B consulta a USER_A por correo con userBToken. El resultado esperado es HTTP 403 sin exposición de datos privados.

### TC-AUTH-013

1. Emitir roleInjectionToken mientras role_injection_e2e está activo.
2. Desactivar el usuario en pulsepass_e2e conservando el JWT anterior.
3. Ejecutar GET /api/auth/me y comprobar HTTP 401.
4. Restaurar active = TRUE inmediatamente.

Comando de desactivación:

    docker exec pulsepass-e2e-db psql -U pulsepass_e2e -d pulsepass_e2e -c "UPDATE users SET active = FALSE WHERE username = 'role_injection_e2e';"

Comando de restauración:

    docker exec pulsepass-e2e-db psql -U pulsepass_e2e -d pulsepass_e2e -c "UPDATE users SET active = TRUE WHERE username = 'role_injection_e2e';"

### TC-SEC-017

1. Emitir staffToken mientras staff_e2e conserva STAFF.
2. Retirar STAFF en pulsepass_e2e conservando el JWT anterior.
3. Consultar los tickets pagados y comprobar HTTP 403.
4. Restaurar inmediatamente el rol STAFF.

Comando de revocación:

    docker exec pulsepass-e2e-db psql -U pulsepass_e2e -d pulsepass_e2e -c "DELETE FROM user_roles WHERE user_id = (SELECT id FROM users WHERE username = 'staff_e2e') AND role = 'STAFF';"

Comando de restauración:

    docker exec pulsepass-e2e-db psql -U pulsepass_e2e -d pulsepass_e2e -c "INSERT INTO user_roles (user_id, role) SELECT id, 'STAFF' FROM users WHERE username = 'staff_e2e' ON CONFLICT DO NOTHING;"

## Preparación de JWT especiales

- tamperedToken: JWT válido con al menos un carácter de la firma alterado.
- expiredToken: JWT correctamente firmado con exp anterior a la hora actual.
- foreignIssuerToken: JWT con otra clave o issuer diferente de expectedIssuer.
- invalidBearerToken: valor que no tenga la estructura válida de tres segmentos.

Todos estos valores son secretos locales. No deben exportarse, incluirse en capturas ni subirse a Git.


<!-- TRAZABILIDAD_IDS_PRD_INICIO -->

## Correspondencia con los identificadores oficiales del PRD

| Identificador PRD | Solicitud o solicitudes ejecutadas |
|---|---|
| `TC-AUTH-001` | USR-01 - Registrar USER_A - 201 |
| `TC-AUTH-002` | AUTH-03 - Login USER_A - 200 |
| `TC-AUTH-007` | AUTH-06 - Consultar identidad sin autenticación - 401 |
| `TC-AUTH-014` | TC-SEC-001B - USER_A no crea eventos - 403 |
| `TC-SEC-009` | TKT-05 - USER_B intenta leer ticket de USER_A - 403 |
| `TC-SEC-011` | TKT-06 - USER_B intenta cancelar ticket de USER_A - 403 |
| `TC-SEC-014` | TKT-11 - STAFF marca ticket como usado - 200 |
| `TC-BIZ-001` | VEN-01 - Listar venues activos - 200; VEN-02 - Consultar venue por código - 200 |
| `TC-BIZ-002` | ART-01 - Listar artistas activos - 200; ART-02 - Consultar artista por ID - 200; ART-03 - Consultar artista por nombre artístico - 200 |
| `TC-BIZ-003` | EVT-01 - Crear evento como ADMIN - 201 |
| `TC-BIZ-004` | EVT-04 - Publicar evento como ADMIN - 200; FLOW-C-06 - Consultar públicamente el evento recién publicado - 200 |
| `TC-BIZ-006` | USR-01 - Registrar USER_A - 201; USR-02 - Registrar USER_B - 201; USR-06 - Registrar USER_A duplicado - 409 |
| `TC-BIZ-007` | TKT-01 - USER_A compra ticket cancelable - 201; TKT-02 - USER_A compra ticket utilizable - 201 |
| `TC-BIZ-008` | TKT-03 - USER_A lista sus tickets - 200; TKT-04 - USER_A consulta su ticket - 200 |
| `TC-BIZ-009` | TKT-08 - STAFF lista tickets pagados del evento - 200 |
| `TC-BIZ-011` | TKT-13 - Cancelar nuevamente ticket cancelado - 409 |
| `TC-BIZ-012` | TKT-11 - STAFF marca ticket como usado - 200; TKT-12 - USER_A verifica ticket usado - 200 |

Estas correspondencias no representan casos adicionales. Identifican las solicitudes ya ejecutadas que materializan cada caso mínimo de la guía.

<!-- TRAZABILIDAD_IDS_PRD_FIN -->

<!-- GUIA_E2E_COMPLEMENTO_FIN -->
