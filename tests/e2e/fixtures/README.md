# Fixtures para pruebas E2E manuales

Este directorio contiene los datos determinísticos necesarios para ejecutar manualmente las pruebas E2E de PulsePass con Postman.

## Base de datos

Los fixtures deben cargarse exclusivamente sobre la base de datos `pulsepass_e2e`.

No deben ejecutarse sobre bases de desarrollo, pruebas automatizadas o producción.

## Datos incluidos

El archivo `seed-e2e.sql` prepara:

- El venue activo `VEN-E2E-ACTIVE`.
- El venue inactivo `VEN-E2E-INACTIVE`.
- El venue de capacidad uno `VEN-E2E-CAPACITY-ONE`.
- El evento publicado `EVT-E2E-PUBLISHED`.
- El evento en borrador `EVT-E2E-DRAFT`.
- El evento reservado para publicación `EVT-E2E-TO-PUBLISH`.
- El evento de edad mínima `EVT-E2E-MINIMUM-AGE`.
- El evento sin disponibilidad `EVT-E2E-SOLD-OUT`.
- La asociación requerida con el artista Solar Beat.
- El usuario activo `admin_e2e` con rol ADMIN.
- El usuario activo `staff_e2e` con rol STAFF.
- El usuario inactivo `inactive_e2e` con rol USER.
- El ticket pagado `TCK-E2E-SOLD-OUT-SEED` que ocupa la única localidad del evento sin disponibilidad.

Los usuarios USER_A, USER_B y el usuario usado para comprobar inyección de rol se registran manualmente mediante la API, porque su registro forma parte de las pruebas E2E.

Los tickets cancelable y utilizable se compran manualmente mediante la API. No se insertan directamente porque su creación y sus cambios de estado forman parte de los flujos E2E.

## Credenciales locales

Las contraseñas se entregan al script mediante variables locales de `psql` y no se almacenan literalmente en el repositorio.

Las credenciales, contraseñas, hashes, tokens JWT y demás valores sensibles deben conservarse únicamente de forma local y nunca deben exportarse ni subirse a Git.

## Repetición controlada

El script usa identificadores con el prefijo E2E y operaciones controladas para permitir una preparación determinística.

Debe ejecutarse con `ON_ERROR_STOP=1`. El script utiliza una transacción y solo confirma los cambios cuando todas las operaciones finalizan correctamente.

Antes de una ejecución integral debe restablecerse la base E2E según las instrucciones del README principal.
