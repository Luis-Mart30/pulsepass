import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Boton } from '../componentes/Boton'
import { RUTAS } from '../lib/rutas'

export default function ErrorPagina() {
  const error: unknown = useRouteError()

  const mensaje = isRouteErrorResponse(error)
    ? `Error ${error.status} al cargar la página.`
    : 'Ocurrió un error inesperado al cargar la página.'

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
      <section
        className="aviso-pulsepass w-full max-w-lg rounded-3xl border border-violet-200 bg-white p-6 text-center shadow-sm sm:p-9 dark:border-slate-700 dark:bg-slate-900"
        aria-labelledby="titulo-error"
      >
        <p className="font-semibold text-violet-600">PulsePass</p>
        <h1
          id="titulo-error"
          className="font-titulo mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white"
        >
          No pudimos cargar esta página
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300" role="alert">
          {mensaje}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Boton type="button" onClick={() => window.location.reload()}>
            Reintentar
          </Boton>
          <Link
            to={RUTAS.INICIO}
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  )
}
