# PulsePass

Plataforma para la gestión de eventos, artistas, sedes, usuarios y entradas.

## Integrantes

- Luis Jaime Martínez Monsalvo — Código: 2023214025
- Angelica Sierra Zapata — Código: 2023214030

## Estructura del repositorio

Este repositorio contiene dos aplicaciones independientes:

- `pulsepass-api`: backend REST desarrollado con Java 21, Spring Boot, PostgreSQL, Flyway y Spring Security.
- `pulsepass-web`: frontend desarrollado con React, TypeScript, Vite, Tailwind CSS y TanStack Query.

## Ejecutar el backend

Desde la raíz del repositorio:

```powershell
Set-Location .\pulsepass-api
.\mvnw.cmd spring-boot:run
```

Las variables requeridas están documentadas en `pulsepass-api/.env.example`.

## Ejecutar el frontend

Desde la raíz del repositorio:

```powershell
Set-Location .\pulsepass-web
npm.cmd install
npm.cmd run dev
```

El frontend se abre normalmente en `http://localhost:5173` y consume la API mediante la ruta `/api`.
Antes de iniciar el backend, configura ese origen y una clave JWT válida en la
misma terminal:

```powershell
$env:PULSEPASS_CORS_ALLOWED_ORIGINS = "http://localhost:5173"
$jwtBytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($jwtBytes)
$env:PULSEPASS_JWT_SECRET_BASE64 = [Convert]::ToBase64String($jwtBytes)
$rng.Dispose()
```

## Verificación

Backend:

```powershell
Set-Location .\pulsepass-api
.\mvnw.cmd test
```

Frontend:

```powershell
Set-Location .\pulsepass-web
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

La documentación específica del backend y del frontend se encuentra dentro de
cada proyecto. El README del frontend incluye las variables, comandos, roles y
rutas requeridas para la entrega.
