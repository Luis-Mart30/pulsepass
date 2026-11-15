import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'

export default function SinPermisos() {
  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 place-items-center px-4 py-16 sm:px-6">
      <section
        className="grid w-full max-w-4xl items-center gap-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2 md:p-12 dark:border-slate-800 dark:bg-slate-900"
        aria-labelledby="titulo-sin-permisos"
      >
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400">
            Error 403
          </p>

          <h1
            id="titulo-sin-permisos"
            className="mt-3 text-4xl font-bold text-slate-950 dark:text-white"
          >
            No tienes permisos
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Tu cuenta no cuenta con el rol necesario para acceder a
            esta sección de PulsePass.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={RUTAS.INICIO}
              className="inline-flex min-h-11 items-center rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              Volver al inicio
            </Link>

            <Link
              to={RUTAS.EVENTOS}
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Explorar eventos
            </Link>
          </div>
        </div>

        <div
          className="mx-auto flex size-56 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-28"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <path d="M12 14v2" />
          </svg>
        </div>
      </section>
    </main>
  )
}