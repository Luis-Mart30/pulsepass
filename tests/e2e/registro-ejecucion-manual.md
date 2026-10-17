# Registro de ejecución manual E2E

## Datos de la ejecución

- Fecha: 17 de octubre de 2026
- Responsable: Luis Jaime Martínez Monsalvo
- Rama: fix/e2e-cumplimiento-guia-luis
- Aplicación: http://localhost:8080
- Base de datos: PostgreSQL 16 en pulsepass_e2e
- Cliente: Postman
- Colección: PulsePass Manual E2E
- Entorno: PulsePass Local E2E
- Ejecución: manual, solicitud por solicitud mediante Send

## Preparación verificada

- Base de datos E2E reiniciada desde un estado limpio.
- Migraciones de Flyway 1 a 4 ejecutadas correctamente.
- Fixtures E2E cargados con ON_ERROR_STOP y transacción confirmada.
- Colección importada con 96 solicitudes distribuidas en 10 carpetas.
- Contraseñas y tokens configurados únicamente en el entorno local de Postman.
- Carpetas ejecutadas manualmente desde 00 hasta 09 en el orden documentado.

## Resumen final

| Estado | Cantidad |
|---|---:|
| PASS | 96 |
| FAIL | 0 |
| BLOCKED | 0 |
| NOT RUN | 0 |

## Cobertura comprobada

Se verificaron autenticación JWT, claims obligatorios, expiración, tokens alterados, autorización por roles, acceso anónimo, usuarios inactivos, propiedad y aislamiento de recursos, validaciones, reglas de negocio, persistencia de operaciones permitidas y ausencia de mutación después de operaciones denegadas.

Las respuestas obtenidas cubrieron los códigos HTTP 200, 201, 400, 401, 403, 404 y 409. No se presentaron respuestas HTTP 500 durante la ejecución final.

Los casos TC-SEC-004 y TC-AUTH-015 se documentaron conforme al comportamiento contractual comprobado: 403 para el borrador consultado anónimamente y 200 para el endpoint público con JWT inválido sin autenticar al actor.

## Resultado

Las 96 solicitudes finalizaron con el código HTTP y el comportamiento esperado.

Resultado general: PASS.
