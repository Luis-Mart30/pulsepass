import {
  isRouteErrorResponse,
  useRouteError,
} from 'react-router'

export default function ErrorPagina() {
  const error: unknown = useRouteError()

  const mensaje = isRouteErrorResponse(error)
    ? `Error ${error.status}: ${error.statusText}`
    : 'Ocurrió un error inesperado al cargar la página.'

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
      <section
        className="max-w-lg text-center"
        aria-labelledby="titulo-error"
      >
        <p className="font-semibold text-violet-600">PulsePass</p>
        <h1
          id="titulo-error"
          className="mt-2 text-3xl font-bold text-slate-950 dark:text-white"
        >
          No pudimos cargar esta página
        </h1>
        <p
          className="mt-4 text-slate-600 dark:text-slate-300"
          role="alert"
        >
          {mensaje}
        </p>
      </section>
    </main>
  )
}