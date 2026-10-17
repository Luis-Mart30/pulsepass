# Fixtures para pruebas E2E manuales

Este directorio contiene los datos determinísticos necesarios para ejecutar las pruebas manuales de PulsePass con Postman.

## Base de datos

Los fixtures deben cargarse exclusivamente sobre la base de datos `pulsepass_e2e`.

No deben ejecutarse sobre una base de desarrollo, pruebas automatizadas o producción.

## Datos incluidos

El archivo `seed-e2e.sql` prepara:

- Un venue activo.
- Un venue inactivo.
- Un evento publicado.
- Un evento en borrador.
- Un evento reservado para el flujo de publicación.
- Una asociación con el artista Solar Beat.
- Un usuario con rol ADMIN.
- Un usuario con rol STAFF.
- Un usuario inactivo con rol USER.

Los usuarios USER_A y USER_B deben registrarse manualmente mediante la API para comprobar el flujo real de registro.

Los tickets cancelable y utilizable deben comprarse manualmente mediante la API. No se insertan directamente porque su creación forma parte de las pruebas E2E.

## Credenciales locales

Las contraseñas se proporcionan al script mediante variables de psql y no se almacenan en el repositorio.

Las credenciales, los tokens JWT y demás valores sensibles deben conservarse únicamente de forma local y nunca deben exportarse ni subirse a Git.

## Repetición

El script utiliza datos identificados con el prefijo E2E y operaciones idempotentes para permitir su ejecución controlada más de una vez.