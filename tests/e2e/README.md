# Pruebas E2E manuales de PulsePass

Este directorio contiene los artefactos utilizados para verificar manualmente la API REST de PulsePass mediante Postman.

## Alcance

La colección cubre las 22 rutas de la API mediante 46 casos manuales positivos y negativos.

Se verifican:

- Consultas públicas de venues, artistas y eventos.
- Registro e inicio de sesión.
- Autenticación mediante JWT.
- Autorización para los roles USER, STAFF y ADMIN.
- Propiedad y aislamiento de recursos.
- Compra, consulta, cancelación y uso de tickets.
- Respuestas HTTP 200, 201, 400, 401, 403, 404 y 409.
- Ausencia de respuestas HTTP 500 durante la ejecución válida.

## Estructura

`	ext
tests/e2e/
|-- README.md
|-- .gitignore
|-- checklist-e2e-manual.md
|-- registro-ejecucion-manual.md
|-- fixtures/
|   |-- README.md
|   -- seed-e2e.sql
-- postman/
    |-- PulsePass-Manual-E2E.postman_collection.json
    -- PulsePass-local.postman_environment.json
`",
    ",


- Java 21.
- Docker Desktop.
- PostgreSQL 16 mediante Docker.
- Postman Desktop.
- Aplicación PulsePass disponible en http://localhost:8080.

## Base de datos aislada

Las pruebas deben ejecutarse exclusivamente sobre la base de datos pulsepass_e2e.

No se debe utilizar una base de desarrollo, pruebas automatizadas o producción.

Los datos determinísticos se encuentran en fixtures/seed-e2e.sql.

## Importación en Postman

1. Importar postman/PulsePass-Manual-E2E.postman_collection.json.
2. Importar postman/PulsePass-local.postman_environment.json.
3. Seleccionar el entorno PulsePass Local E2E.
4. Completar localmente las contraseñas y tokens.
5. No guardar ni compartir secretos reales.

## Ejecución

Las solicitudes deben ejecutarse manualmente y en el orden de la colección utilizando el botón Send.

No se utilizan scripts de Postman, Collection Runner, Newman ni herramientas CLI para automatizar la ejecución.

Los tokens JWT deben copiarse manualmente desde las respuestas de inicio de sesión hacia las variables locales correspondientes.

## Registro de resultados

Cada caso se clasifica como:

- PASS: comportamiento esperado.
- FAIL: comportamiento diferente al esperado.
- BLOCKED: no pudo ejecutarse por una dependencia externa.
- NOT RUN: no fue ejecutado.

El resultado de la ejecución realizada está documentado en:

- checklist-e2e-manual.md
- registro-ejecucion-manual.md

## Seguridad

Los archivos versionados no deben contener contraseñas, tokens JWT ni credenciales privadas.

Las variables sensibles se completan exclusivamente en el entorno local de Postman y no se exportan al repositorio.

## Resultado obtenido

La ejecución final registró 46 casos PASS, sin casos FAIL, BLOCKED o NOT RUN y sin respuestas HTTP 500.
