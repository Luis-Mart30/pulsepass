import { Link, useParams } from 'react-router'
import { useArtistaPorId } from '../funcionalidades/artistas/consultas'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export default function DetalleArtista() {
  const { id: idParametro } = useParams<{ id: string }>()
  const idConvertido = Number(idParametro)
  const id =
    Number.isInteger(idConvertido) && idConvertido > 0
      ? idConvertido
      : null

  const consulta = useArtistaPorId(id)

  if (id === null) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
          Artista no encontrado
        </h1>
        <p
          role="alert"
          className="mt-4 text-slate-600 dark:text-slate-300"
        >
          El identificador del artista no es válido.
        </p>
        <Link
          to={RUTAS.ARTISTAS}
          className="mt-6 inline-flex font-semibold text-violet-600 hover:text-violet-700"
        >
          Volver a artistas
        </Link>
      </section>
    )
  }

  if (consulta.isPending) {
    return (
      <section
        className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8"
        aria-live="polite"
      >
        <p className="text-slate-600 dark:text-slate-300">
          Cargando información del artista…
        </p>
      </section>
    )
  }

  if (consulta.isError) {
    const noEncontrado =
      consulta.error instanceof ApiError &&
      consulta.error.status === 404

    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
          {noEncontrado
            ? 'Artista no encontrado'
            : 'No pudimos cargar el artista'}
        </h1>
        <p
          role="alert"
          className="mt-4 text-slate-600 dark:text-slate-300"
        >
          {noEncontrado
            ? 'El artista solicitado no existe o ya no está disponible.'
            : 'Ocurrió un problema al consultar la información. Intenta nuevamente.'}
        </p>
        <Link
          to={RUTAS.ARTISTAS}
          className="mt-6 inline-flex font-semibold text-violet-600 hover:text-violet-700"
        >
          Volver a artistas
        </Link>
      </section>
    )
  }

  const artista = consulta.data

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to={RUTAS.ARTISTAS}
        className="font-semibold text-violet-600 hover:text-violet-700"
      >
        ← Volver a artistas
      </Link>

      <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
              {artista.genre}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                artista.active
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {artista.active ? 'Activo' : 'No disponible'}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl dark:text-white">
            {artista.stageName}
          </h1>

          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                País
              </dt>
              <dd className="mt-1 text-lg text-slate-950 dark:text-white">
                {artista.country}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Género musical
              </dt>
              <dd className="mt-1 text-lg text-slate-950 dark:text-white">
                {artista.genre}
              </dd>
            </div>
          </dl>
        </div>
      </article>
    </section>
  )
}