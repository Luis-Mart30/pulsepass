# Registro de ejecución manual E2E

## Datos de la ejecución

- Fecha: 16 de octubre de 2026
- Responsable: Luis Jaime Martínez Monsalvo
- Rama: feature/e2e-catalogo-eventos-luis
- Aplicación: http://localhost:8080
- Base de datos: PostgreSQL 16 en pulsepass_e2e
- Cliente: Postman
- Colección: PulsePass Manual E2E
- Entorno: PulsePass Local E2E
- Ejecución: manual, solicitud por solicitud mediante Send

## Resumen

| Estado | Cantidad |
|---|---:|
| PASS | 46 |
| FAIL | 0 |
| BLOCKED | 0 |
| NOT RUN | 0 |

## Incidencias operativas resueltas

- Se agregaron al entorno local las variables userAUsername y userBUsername.
- Se corrigieron valores locales de contraseñas que estaban vacíos.
- Se renovaron manualmente tokens JWT al vencer su duración de 15 minutos.
- Se agregó el token de USER_B antes de comprobar las respuestas 403.
- Las solicitudes afectadas se repitieron y obtuvieron finalmente el resultado esperado.
- Las incidencias fueron de configuración local de Postman y no defectos de la API.

## Resultado

Las 46 solicitudes de la colección finalizaron con el código HTTP y el comportamiento esperado.

Se comprobaron autenticación, autorización por roles, propiedad de recursos, reglas de negocio, persistencia de cambios permitidos y ausencia de mutación después de operaciones prohibidas.

No se presentaron respuestas HTTP 500 durante la ejecución final válida.

Resultado general: PASS.
