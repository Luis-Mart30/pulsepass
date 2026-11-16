# PulsePass

Plataforma para la gestión de eventos, artistas, sedes, usuarios y entradas.

## Integrantes

- Luis Jaime Martínez Monsalvo — Código: 2023214025
- Angelica Sierra Zapata — Código: 2023214030

## Estructura del repositorio

Este repositorio contiene dos aplicaciones independientes:

- `pulsepass-api`: backend REST desarrollado con Java 21, Spring Boot, PostgreSQL, Flyway y Spring Security.
- `pulsepass-web`: frontend desarrollado con React, TypeScript, Vite, Tailwind CSS y TanStack Query.

## Ejecutar PulsePass en Windows

Necesitas Java 21, Node.js 22.22 o posterior y PostgreSQL. Los comandos
siguientes usan PowerShell y Docker Desktop para iniciar PostgreSQL 16, la
misma versión principal que se usa en las pruebas de integración.

### 1. Iniciar PostgreSQL

Con Docker Desktop en ejecución, crea la base local una sola vez:

```powershell
docker run --name pulsepass-postgres -e POSTGRES_DB=pulsepass -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 127.0.0.1:5432:5432 -d postgres:16-alpine
docker exec pulsepass-postgres pg_isready -U postgres -d pulsepass
```

Para volver a iniciar ese contenedor en otra sesión, usa
`docker start pulsepass-postgres`. Espera a que
`pg_isready` indique que PostgreSQL acepta conexiones. Si ya tienes una
base local, usa sus valores de conexión en el paso siguiente.

### 2. Configurar e iniciar el backend

Desde la raíz del repositorio, ejecuta todo el bloque en una misma terminal.
Las variables se aplican al proceso que inicia esa terminal.

```powershell
Set-Location .\pulsepass-api
$env:DB_URL = "jdbc:postgresql://localhost:5432/pulsepass"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "postgres"
$env:PULSEPASS_CORS_ALLOWED_ORIGINS = "http://localhost:5173"
$jwtBytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($jwtBytes)
$env:PULSEPASS_JWT_SECRET_BASE64 = [Convert]::ToBase64String($jwtBytes)
$rng.Dispose()
.\mvnw.cmd spring-boot:run
```

Flyway aplica las migraciones al iniciar el backend. Deja esta terminal
abierta mientras usas la aplicación. Consulta
[la configuración del backend](pulsepass-api/.env.example) para ver las
demás variables disponibles.

### 3. Iniciar el frontend

En una segunda terminal, desde la raíz del repositorio:

```powershell
Set-Location .\pulsepass-web
npm.cmd ci
npm.cmd run dev
```

Abre [PulsePass](http://localhost:5173). Vite redirige las solicitudes
`/api` al backend local en el puerto 8080. Para cargar eventos y cuentas
de prueba, sigue la [guía E2E](pulsepass-api/tests/e2e/README.md).

## Verificación

Backend, con Docker Desktop en ejecución para Testcontainers:

```powershell
Set-Location .\pulsepass-api
.\mvnw.cmd test
```

Frontend, desde la raíz del repositorio y con las dependencias instaladas:

```powershell
Set-Location .\pulsepass-web
npm.cmd test
npm.cmd run build
npm.cmd run lint
npm.cmd run format:check
```

La documentación específica del backend y del frontend se encuentra dentro de
cada proyecto. El README del frontend incluye las variables, comandos, roles y
rutas requeridas para la entrega.
