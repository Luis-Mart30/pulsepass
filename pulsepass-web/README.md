# PulsePass Web

Aplicación web de PulsePass para explorar eventos, comprar y gestionar
entradas, validar ingresos y administrar eventos según el rol de la sesión.

## Tecnologías

- React 19 y TypeScript en modo estricto.
- Vite y Tailwind CSS.
- React Router con rutas perezosas.
- TanStack Query para estado del servidor y caché.
- React Hook Form y Zod para formularios y validación.
- Vitest, Testing Library y MSW para pruebas.

## Requisitos

- Node.js 22.22 o posterior.
- npm.
- PulsePass API disponible en `http://localhost:8080`.

## Configuración

La única variable del frontend es:

| Variable | Descripción | Valor local |
|---|---|---|
| `VITE_API_BASE_URL` | Base de las solicitudes HTTP | `/api` |

El archivo `.env.example` contiene el valor recomendado. Con `/api`, el
servidor de desarrollo de Vite redirige las solicitudes al backend en el
puerto `8080` mediante el proxy de `vite.config.ts`.

Para usar una API remota, crea un archivo `.env.local` —ignorado por Git— y
define una URL completa:

```dotenv
VITE_API_BASE_URL=https://api.ejemplo.com/api
```

No se deben guardar secretos ni tokens en variables `VITE_*`, porque sus
valores se incorporan al bundle del navegador.

## Instalación y ejecución

Desde `pulsepass-web` en Windows PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

La aplicación queda disponible normalmente en `http://localhost:5173`.

El backend debe permitir ese origen. En la terminal donde se inicia la API:

```powershell
$env:PULSEPASS_CORS_ALLOWED_ORIGINS = "http://localhost:5173"
```

## Comandos

| Comando | Propósito |
|---|---|
| `npm.cmd run dev` | Servidor local con recarga automática |
| `npm.cmd run build` | Comprobación TypeScript y build de producción |
| `npm.cmd run preview` | Previsualización del build |
| `npm.cmd test` | Suite completa de Vitest |
| `npm.cmd run test:watch` | Pruebas en modo interactivo |
| `npm.cmd run lint` | Análisis estático con ESLint |
| `npm.cmd run format:check` | Verificación de formato con Prettier |

## Roles de demostración

La interfaz consume los roles entregados por `GET /api/auth/me`.

| Rol | Capacidades principales |
|---|---|
| `USER` | Consultar su cuenta y sus tickets, comprar y cancelar entradas |
| `STAFF` | Validar ingresos y consultar tickets pagados de un evento |
| `ADMIN` | Buscar, crear, configurar y publicar eventos; también puede ejecutar operaciones de STAFF |

Las credenciales no se almacenan en este repositorio. Las cuentas de
demostración deben crearse o provisionarse en el entorno local del backend.
Ocultar enlaces por rol mejora la experiencia, pero la autorización efectiva
siempre corresponde a la API.

## Rutas principales

### Públicas y de autenticación

| Ruta | Pantalla |
|---|---|
| `/` | Inicio |
| `/eventos` | Catálogo de eventos |
| `/eventos/:eventCode` | Detalle y compra de un evento |
| `/artistas` | Artistas activos |
| `/artistas/:id` | Detalle de artista |
| `/sedes` | Sedes activas |
| `/sedes/:code` | Detalle de sede |
| `/login` | Inicio de sesión |
| `/registro` | Registro |

### Sesión autenticada

| Ruta | Acceso |
|---|---|
| `/cuenta` | Cualquier sesión autenticada |
| `/mis-tickets` | USER |
| `/mis-tickets/:ticketCode` | USER |
| `/compra/confirmacion/:ticketCode` | USER |
| `/staff/validacion` | STAFF o ADMIN |
| `/staff/eventos/:eventCode/tickets` | STAFF o ADMIN |
| `/admin/eventos` | ADMIN |
| `/admin/eventos/nuevo` | ADMIN |
| `/admin/eventos/:eventCode` | ADMIN |
| `/403` | Acceso sin permisos |
| `*` | Página no encontrada |

Excepto Inicio y el Layout, las páginas se cargan de forma perezosa desde la
configuración de `src/app/router.tsx`.

## Sesión y seguridad

- El JWT se conserva en `sessionStorage`, nunca en `localStorage`.
- Se envía únicamente en el encabezado `Authorization: Bearer`.
- Una respuesta `401` elimina la sesión y la caché antes de volver al login.
- Las respuestas externas se validan con Zod.
- El frontend no implementa reglas de negocio: presenta los errores de la API.

## Estructura

```text
src/
├── app/               Router, guardas y raíz de la aplicación
├── componentes/       UI reutilizable y accesible
├── funcionalidades/   API, tipos Zod y consultas por dominio
├── layouts/           Navegación y estructura compartida
├── lib/               HTTP, rutas, formatos y Query Client
├── pages/             Páginas y pruebas de interacción
└── test/              Configuración de Vitest y MSW
```

## Verificación antes de entregar

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd test
git diff --check
git status
```

Los tests interceptan la red con MSW; no dependen de una API real.
