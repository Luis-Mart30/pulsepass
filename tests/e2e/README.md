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
$adminPassword = "AdminPulse2026!"
$staffPassword = "StaffPulse2026!"
$inactivePassword = "InactivePulse2026!"

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

Después de cada login, copiar manualmente `accessToken` a:

- `adminToken`
- `staffToken`
- `userAToken`
- `userBToken`

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