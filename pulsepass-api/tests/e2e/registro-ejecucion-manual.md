# Registro de ejecución manual E2E

## Datos de la ejecución

- Fecha: 17 de octubre de 2026
- Responsable: Luis Jaime Martínez Monsalvo
- Rama: feature/pruebas-e2e-postman
- Aplicación: http://localhost:8080
- Base de datos: PostgreSQL 16 en pulsepass_e2e
- Cliente: Postman
- Colección: PulsePass Manual E2E
- Entorno: PulsePass Local E2E
- Ejecución: manual, solicitud por solicitud mediante Send

## Preparación verificada

- Base de datos E2E independiente y disponible.
- Migraciones de Flyway 1 a 4 validadas correctamente.
- Fixtures determinísticos cargados.
- Colección Postman v2.1 sin scripts automáticos.
- Contraseñas y JWT utilizados exclusivamente como valores locales.
- Cobertura de las 22 rutas de la API.
- Usuario temporalmente desactivado y posteriormente restaurado.
- Rol STAFF temporalmente revocado y posteriormente restaurado.

## Casos incorporados durante la revisión final

| Caso | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---:|---:|---|---|
| TC-SEC-006 | 403 | 403 | PASS | Captura Postman 17:03:12 |
| TC-AUTH-013 | 401 | 401 | PASS | Captura Postman 17:04:44 y restauración del usuario |
| TC-SEC-017 | 403 | 403 | PASS | Captura Postman 17:06:34 y restauración del rol STAFF |

## Resumen final

| Estado | Cantidad |
|---|---:|
| PASS | 99 |
| FAIL | 0 |
| BLOCKED | 0 |
| NOT RUN | 0 |

## Cobertura comprobada

Se verificaron registro, login, identidad, claims JWT, expiración, tokens alterados, autorización por roles, acceso anónimo, usuarios inactivos, desactivación posterior a la emisión del JWT, revocación inmediata de privilegios, propiedad y aislamiento de recursos, validaciones, reglas de negocio, persistencia de operaciones permitidas y ausencia de mutación después de operaciones denegadas.

Las respuestas obtenidas cubrieron HTTP 200, 201, 400, 401, 403, 404 y 409. No se presentaron respuestas HTTP 500.

Los 99 casos finalizaron con el código HTTP y comportamiento esperado.

Resultado general: PASS.
