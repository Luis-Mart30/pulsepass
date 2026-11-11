import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../funcionalidades/auth/useAuth'
import { RUTAS } from '../lib/rutas'

const claseEnlace =
  'rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:text-slate-200 dark:hover:bg-slate-800'

export default function Layout() {
  const { sesion, cerrarSesion, tieneRol } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3 focus:text-slate-950"
      >
        Saltar al contenido
      </a>

      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <nav
          aria-label="Principal"
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-4 sm:px-6 lg:px-8"
        >
          <NavLink
            to={RUTAS.INICIO}
            end
            className="mr-auto text-xl font-black text-violet-700"
          >
            PulsePass
          </NavLink>

          <NavLink to={RUTAS.EVENTOS} className={claseEnlace}>
            Eventos
          </NavLink>
          <NavLink to={RUTAS.ARTISTAS} className={claseEnlace}>
            Artistas
          </NavLink>
          <NavLink to={RUTAS.SEDES} className={claseEnlace}>
            Sedes
          </NavLink>

          {sesion.estado === 'anonimo' && (
            <>
              <NavLink to={RUTAS.LOGIN} className={claseEnlace}>
                Iniciar sesión
              </NavLink>
              <NavLink to={RUTAS.REGISTRO} className={claseEnlace}>
                Registrarse
              </NavLink>
            </>
          )}

          {sesion.estado === 'autenticado' && (
            <>
              {tieneRol('USER') && (
                <NavLink
                  to={RUTAS.MIS_TICKETS}
                  className={claseEnlace}
                >
                  Mis tickets
                </NavLink>
              )}

              {tieneRol('STAFF', 'ADMIN') && (
                <NavLink
                  to={RUTAS.STAFF_VALIDACION}
                  className={claseEnlace}
                >
                  Validar ingreso
                </NavLink>
              )}

              {tieneRol('ADMIN') && (
                <NavLink
                  to={RUTAS.ADMIN_EVENTOS}
                  className={claseEnlace}
                >
                  Administrar
                </NavLink>
              )}

              <NavLink to={RUTAS.CUENTA} className={claseEnlace}>
                Mi cuenta
              </NavLink>

              <button
                type="button"
                onClick={cerrarSesion}
                className={claseEnlace}
              >
                Salir
              </button>
            </>
          )}
        </nav>
      </header>

      <main id="contenido" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        PulsePass · Plataforma de eventos y entradas
      </footer>
    </div>
  )
}