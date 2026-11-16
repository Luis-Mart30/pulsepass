import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useMatch,
  type NavLinkRenderProps,
} from 'react-router'
import { useAuth } from '../funcionalidades/auth/useAuth'
import { RUTAS, SECCION_TICKETS_PAGADOS } from '../lib/rutas'
import { IconoNota } from '../componentes/IconoNota'
import { AvatarCuenta, MenuCuenta } from './MenuCuenta'

const CLASE_FOCO_ENLACE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:focus-visible:outline-violet-300'

const CLASE_ENLACE_BASE = clsx(
  'rounded-full px-3 py-2 text-sm font-semibold transition-colors',
  CLASE_FOCO_ENLACE,
)

const CLASE_ACCION_ENCABEZADO = clsx(
  'inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors',
  CLASE_FOCO_ENLACE,
)

const CLASE_ENLACE_INACTIVO =
  'text-[#241044] hover:bg-violet-100 hover:text-violet-800 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-violet-200'

function claseEnlace({ isActive }: NavLinkRenderProps) {
  return clsx(
    CLASE_ENLACE_BASE,
    isActive
      ? 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200'
      : CLASE_ENLACE_INACTIVO,
  )
}

export default function Layout() {
  const { sesion, cerrarSesion, tieneRol } = useAuth()
  const enInicio = Boolean(useMatch({ path: RUTAS.INICIO, end: true }))
  const claseLogin = clsx(
    CLASE_ACCION_ENCABEZADO,
    'border border-[#241044] text-[#241044] hover:bg-violet-100 aria-[current=page]:bg-violet-100 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800 dark:aria-[current=page]:bg-slate-800',
  )
  const claseRegistro = clsx(
    CLASE_ACCION_ENCABEZADO,
    'bg-violet-700 text-white hover:bg-violet-800 aria-[current=page]:ring-2 aria-[current=page]:ring-violet-400',
  )
  const botonMenuMovilRef = useRef<HTMLButtonElement>(null)
  const botonUsuarioRef = useRef<HTMLButtonElement>(null)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false)

  const autenticado = sesion.estado === 'autenticado'
  const username = autenticado ? sesion.usuario.username : ''

  useEffect(() => {
    if (!menuMovilAbierto && !menuUsuarioAbierto) {
      return
    }

    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') {
        return
      }

      if (menuMovilAbierto) {
        setMenuMovilAbierto(false)
        botonMenuMovilRef.current?.focus()
      }

      if (menuUsuarioAbierto) {
        setMenuUsuarioAbierto(false)
        botonUsuarioRef.current?.focus()
      }
    }

    document.addEventListener('keydown', cerrarConEscape)

    return () => {
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [menuMovilAbierto, menuUsuarioAbierto])

  const cerrarMenus = () => {
    setMenuMovilAbierto(false)
    setMenuUsuarioAbierto(false)
  }

  const salir = () => {
    cerrarMenus()
    cerrarSesion()
  }

  const enlacesPublicos = (
    <>
      <NavLink to={RUTAS.EVENTOS} className={claseEnlace} onClick={cerrarMenus}>
        Eventos
      </NavLink>
      <NavLink
        to={RUTAS.ARTISTAS}
        className={claseEnlace}
        onClick={cerrarMenus}
      >
        Artistas
      </NavLink>
      <NavLink to={RUTAS.SEDES} className={claseEnlace} onClick={cerrarMenus}>
        Sedes
      </NavLink>
    </>
  )

  const enlacesRol = autenticado ? (
    <>
      {tieneRol('STAFF', 'ADMIN') ? (
        <>
          <NavLink
            to={RUTAS.STAFF_VALIDACION}
            className={claseEnlace}
            onClick={cerrarMenus}
          >
            Validar ingreso
          </NavLink>
          <Link
            to={`${RUTAS.STAFF_VALIDACION}#${SECCION_TICKETS_PAGADOS}`}
            className={clsx(CLASE_ENLACE_BASE, CLASE_ENLACE_INACTIVO)}
            onClick={cerrarMenus}
          >
            Tickets pagados
          </Link>
        </>
      ) : null}

      {tieneRol('ADMIN') ? (
        <NavLink
          to={RUTAS.ADMIN_EVENTOS}
          className={claseEnlace}
          onClick={cerrarMenus}
        >
          Administrar eventos
        </NavLink>
      ) : null}
    </>
  ) : null

  return (
    <div
      className={clsx(
        'flex min-h-screen flex-col max-md:has-[[data-barra-compra-movil]]:pb-[calc(5rem+env(safe-area-inset-bottom))]',
        enInicio
          ? 'inicio-tipografia bg-slate-50 text-[#241044] dark:bg-slate-950 dark:text-slate-100'
          : 'bg-white text-slate-950 dark:bg-slate-950 dark:text-white',
      )}
    >
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3 focus:text-slate-950"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 shrink-0 border-b border-violet-100 bg-white dark:border-slate-800 dark:bg-slate-950">
        <nav
          aria-label="Principal"
          className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8"
        >
          <NavLink
            to={RUTAS.INICIO}
            end
            onClick={cerrarMenus}
            className="mr-auto inline-flex shrink-0 items-center gap-2.5 text-[#241044] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600 dark:text-slate-100 dark:focus-visible:outline-violet-300"
          >
            <span
              aria-hidden="true"
              className="marca-pulsepass-icono grid size-10 place-items-center rounded-xl bg-violet-700 text-2xl text-white lg:size-11"
            >
              <IconoNota className="size-5 lg:size-6" />
            </span>
            <span className="marca-pulsepass-texto">
              Pulse
              <span className="marca-pulsepass-acento text-violet-700 dark:text-violet-300">
                Pass
              </span>
            </span>
          </NavLink>

          <button
            ref={botonMenuMovilRef}
            type="button"
            aria-expanded={menuMovilAbierto}
            aria-controls="menu-movil"
            aria-label={
              menuMovilAbierto
                ? 'Cerrar menú principal'
                : 'Abrir menú principal'
            }
            onClick={() => setMenuMovilAbierto((abierto) => !abierto)}
            className={clsx(
              CLASE_FOCO_ENLACE,
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-violet-200 text-xl text-[#241044] md:hidden dark:border-slate-700 dark:text-slate-100',
            )}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path
                d={
                  menuMovilAbierto
                    ? 'm6 6 12 12M18 6 6 18'
                    : 'M4 6h16M4 12h16M4 18h16'
                }
              />
            </svg>
          </button>

          <div className="hidden min-w-0 flex-wrap items-center justify-end gap-1.5 md:flex lg:gap-x-2">
            {enlacesPublicos}
            {enlacesRol}

            {!autenticado ? (
              <>
                <NavLink
                  to={RUTAS.LOGIN}
                  className={claseLogin}
                  onClick={cerrarMenus}
                >
                  Iniciar sesión
                </NavLink>
                <NavLink
                  to={RUTAS.REGISTRO}
                  className={claseRegistro}
                  onClick={cerrarMenus}
                >
                  Registrarse
                </NavLink>
              </>
            ) : (
              <div className="relative ml-1">
                <button
                  ref={botonUsuarioRef}
                  type="button"
                  aria-expanded={menuUsuarioAbierto}
                  aria-haspopup="menu"
                  aria-controls="menu-usuario"
                  onClick={() => setMenuUsuarioAbierto((abierto) => !abierto)}
                  className="cuenta-disparador"
                >
                  <AvatarCuenta username={username} />
                  <span className="max-w-36 truncate">{username}</span>
                  <svg
                    className="cuenta-indicador"
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    focusable="false"
                  >
                    <path d="m4 6 4 4 4-4" />
                  </svg>
                </button>

                {menuUsuarioAbierto ? (
                  <MenuCuenta
                    username={username}
                    desplegable
                    mostrarTickets={tieneRol('USER')}
                    alNavegar={cerrarMenus}
                    alSalir={salir}
                  />
                ) : null}
              </div>
            )}
          </div>

          {menuMovilAbierto ? (
            <div
              id="menu-movil"
              className="absolute inset-x-0 top-full grid max-h-[calc(100dvh-5rem)] gap-1 overflow-y-auto overscroll-contain rounded-b-2xl border border-violet-100 bg-white p-4 shadow-lg md:hidden dark:border-slate-800 dark:bg-slate-950"
            >
              {enlacesPublicos}
              {enlacesRol}

              {!autenticado ? (
                <>
                  <NavLink
                    to={RUTAS.LOGIN}
                    className={claseLogin}
                    onClick={cerrarMenus}
                  >
                    Iniciar sesión
                  </NavLink>
                  <NavLink
                    to={RUTAS.REGISTRO}
                    className={claseRegistro}
                    onClick={cerrarMenus}
                  >
                    Registrarse
                  </NavLink>
                </>
              ) : (
                <MenuCuenta
                  username={username}
                  mostrarTickets={tieneRol('USER')}
                  alNavegar={cerrarMenus}
                  alSalir={salir}
                />
              )}
            </div>
          ) : null}
        </nav>
      </header>

      <main id="contenido" className="flex-1">
        <Outlet />
      </main>

      <footer
        className={clsx(
          'border-t px-4 py-6 text-sm',
          enInicio
            ? 'border-violet-200 text-[#5b496a] dark:border-slate-800 dark:text-slate-400'
            : 'border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400',
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p>© 2026 PulsePass · Caso de estudio académico</p>
          <div className="flex gap-4">
            <NavLink to={RUTAS.SEDES} className="hover:text-violet-700">
              Sedes
            </NavLink>
            <NavLink to={RUTAS.ARTISTAS} className="hover:text-violet-700">
              Artistas
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  )
}
