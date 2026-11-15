import clsx from 'clsx'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  NavLink,
  Outlet,
  type NavLinkRenderProps,
} from 'react-router'
import { useAuth } from '../funcionalidades/auth/useAuth'
import { RUTAS } from '../lib/rutas'

const CLASE_ENLACE_BASE =
  'rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600'

function claseEnlace({ isActive }: NavLinkRenderProps) {
  return clsx(
    CLASE_ENLACE_BASE,
    isActive
      ? 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200'
      : 'text-slate-700 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-slate-800',
  )
}

const claseBoton = clsx(
  CLASE_ENLACE_BASE,
  'text-slate-700 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-slate-800',
)

export default function Layout() {
  const { sesion, cerrarSesion, tieneRol } = useAuth()
  const botonMenuMovilRef = useRef<HTMLButtonElement>(null)
  const botonUsuarioRef = useRef<HTMLButtonElement>(null)
  const [menuMovilAbierto, setMenuMovilAbierto] =
    useState(false)
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] =
    useState(false)

  const autenticado = sesion.estado === 'autenticado'
  const username = autenticado ? sesion.usuario.username : ''
  const inicial = username.charAt(0).toUpperCase()

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
      <NavLink
        to={RUTAS.EVENTOS}
        className={claseEnlace}
        onClick={cerrarMenus}
      >
        Eventos
      </NavLink>
      <NavLink
        to={RUTAS.ARTISTAS}
        className={claseEnlace}
        onClick={cerrarMenus}
      >
        Artistas
      </NavLink>
      <NavLink
        to={RUTAS.SEDES}
        className={claseEnlace}
        onClick={cerrarMenus}
      >
        Sedes
      </NavLink>
    </>
  )

  const enlacesRol = autenticado ? (
    <>
      {tieneRol('STAFF', 'ADMIN') ? (
        <NavLink
          to={RUTAS.STAFF_VALIDACION}
          className={claseEnlace}
          onClick={cerrarMenus}
        >
          Validar ingreso
        </NavLink>
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
    <div className="flex min-h-screen flex-col bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3 focus:text-slate-950"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <nav
          aria-label="Principal"
          className="mx-auto flex max-w-7xl flex-wrap items-center px-4 py-3 sm:px-6 lg:px-8"
        >
          <NavLink
            to={RUTAS.INICIO}
            end
            onClick={cerrarMenus}
            className="mr-auto text-xl font-black text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600"
          >
            ♪ PulsePass
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
            onClick={() =>
              setMenuMovilAbierto((abierto) => !abierto)
            }
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 text-xl text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 md:hidden dark:border-slate-700 dark:text-slate-200"
          >
            <span aria-hidden="true">
              {menuMovilAbierto ? '×' : '☰'}
            </span>
          </button>

          <div className="hidden items-center gap-1 md:flex">
            {enlacesPublicos}
            {enlacesRol}

            {!autenticado ? (
              <>
                <NavLink
                  to={RUTAS.LOGIN}
                  className={claseEnlace}
                  onClick={cerrarMenus}
                >
                  Iniciar sesión
                </NavLink>
                <NavLink
                  to={RUTAS.REGISTRO}
                  className={claseEnlace}
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
                  onClick={() =>
                    setMenuUsuarioAbierto(
                      (abierto) => !abierto,
                    )
                  }
                  className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:text-slate-100"
                >
                  <span
                    className="flex size-8 items-center justify-center rounded-full bg-violet-700 font-bold text-white"
                    aria-hidden="true"
                  >
                    {inicial}
                  </span>
                  <span>{username}</span>
                  <span aria-hidden="true">▾</span>
                </button>

                {menuUsuarioAbierto ? (
                  <div
                    id="menu-usuario"
                    role="menu"
                    className="absolute right-0 mt-2 grid min-w-48 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  >
                    <NavLink
                      to={RUTAS.CUENTA}
                      role="menuitem"
                      className={claseEnlace}
                      onClick={cerrarMenus}
                    >
                      Mi cuenta
                    </NavLink>
                    {tieneRol('USER') ? (
                      <NavLink
                        to={RUTAS.MIS_TICKETS}
                        role="menuitem"
                        className={claseEnlace}
                        onClick={cerrarMenus}
                      >
                        Mis tickets
                      </NavLink>
                    ) : null}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={salir}
                      className={clsx(claseBoton, 'text-left')}
                    >
                      Salir
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {menuMovilAbierto ? (
            <div
              id="menu-movil"
              className="mt-3 grid w-full gap-1 border-t border-slate-200 pt-3 md:hidden dark:border-slate-800"
            >
              {enlacesPublicos}
              {enlacesRol}

              {!autenticado ? (
                <>
                  <NavLink
                    to={RUTAS.LOGIN}
                    className={claseEnlace}
                    onClick={cerrarMenus}
                  >
                    Iniciar sesión
                  </NavLink>
                  <NavLink
                    to={RUTAS.REGISTRO}
                    className={claseEnlace}
                    onClick={cerrarMenus}
                  >
                    Registrarse
                  </NavLink>
                </>
              ) : (
                <>
                  <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
                  <p className="px-3 py-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    @{username}
                  </p>
                  <NavLink
                    to={RUTAS.CUENTA}
                    className={claseEnlace}
                    onClick={cerrarMenus}
                  >
                    Mi cuenta
                  </NavLink>
                  {tieneRol('USER') ? (
                    <NavLink
                      to={RUTAS.MIS_TICKETS}
                      className={claseEnlace}
                      onClick={cerrarMenus}
                    >
                      Mis tickets
                    </NavLink>
                  ) : null}
                  <button
                    type="button"
                    onClick={salir}
                    className={clsx(claseBoton, 'text-left')}
                  >
                    Salir
                  </button>
                </>
              )}
            </div>
          ) : null}
        </nav>
      </header>

      <main id="contenido" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
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
