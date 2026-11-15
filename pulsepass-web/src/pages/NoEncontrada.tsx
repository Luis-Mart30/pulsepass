import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'

export default function NoEncontrada() {
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 place-items-center px-4 py-16 sm:px-6">
      <section
        className="grid w-full max-w-4xl items-center gap-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2 md:p-12 dark:border-slate-800 dark:bg-slate-900"
        aria-labelledby="titulo-no-encontrada"
      >
        <div>
          <p className="text-sm font-bold tracking-[0.25em] text-violet-600 uppercase dark:text-violet-400">
            Error 404
          </p>

          <h1
            id="titulo-no-encontrada"
            className="mt-3 text-4xl font-bold text-slate-950 dark:text-white"
          >
            Página no encontrada
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            La dirección que visitaste no existe o pudo haber cambiado. Puedes
            regresar al inicio o continuar explorando los eventos.
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
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
            <path d="M8.5 9.5h.01M13.5 9.5h.01" />
            <path d="M8.5 14c1.5-1 3.5-1 5 0" />
          </svg>
        </div>
      </section>
    </div>
  )
}
