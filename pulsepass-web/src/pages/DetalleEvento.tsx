import { Link, useParams } from 'react-router'
import { useEventoPorCodigo } from '../funcionalidades/eventos/consultas'
import { ApiError } from '../lib/http'
import {
  formatearFechaEvento,
  obtenerEtiquetaCategoria,
} from '../lib/formatos'
import { crearRuta, RUTAS } from '../lib/rutas'

export default function DetalleEvento() {
  const { eventCode = '' } =
    useParams<{ eventCode: string }>()
  const consulta = useEventoPorCodigo(eventCode)

  if (consulta.isPending) {
    return (
      <section
        className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8"
        aria-live="polite"
      >
        <p className="text-slate-600 dark:text-slate-300">
          Cargando información del evento…
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
            ? 'Evento no encontrado'
            : 'No pudimos cargar el evento'}
        </h1>
        <p
          role="alert"
          className="mt-4 text-slate-600 dark:text-slate-300"
        >
          {noEncontrado
            ? 'El evento solicitado no existe o no está disponible.'
            : 'Ocurrió un problema al consultar la información. Intenta nuevamente.'}
        </p>
        <Link
          to={RUTAS.EVENTOS}
          className="mt-6 inline-flex font-semibold text-violet-600 hover:text-violet-700"
        >
          Volver a eventos
        </Link>
      </section>
    )
  }

  const evento = consulta.data

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to={RUTAS.EVENTOS}
        className="font-semibold text-violet-600 hover:text-violet-700"
      >
        ← Volver a eventos
      </Link>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
          {obtenerEtiquetaCategoria(evento.category)}
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl dark:text-white">
          {evento.name}
        </h1>

        {evento.description !== null && (
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
            {evento.description}
          </p>
        )}

        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Fecha
            </dt>
            <dd className="mt-1 text-lg text-slate-950 dark:text-white">
              <time dateTime={evento.eventDate}>
                {formatearFechaEvento(evento.eventDate)}
              </time>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Edad mínima
            </dt>
            <dd className="mt-1 text-lg text-slate-950 dark:text-white">
              {evento.minimumAge === 0
                ? 'Para todas las edades'
                : `${evento.minimumAge} años`}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Sede
            </dt>
            <dd className="mt-1">
              <Link
                to={crearRuta.detalleSede(evento.venueCode)}
                className="text-lg font-semibold text-violet-600 hover:text-violet-700"
              >
                {evento.venueName}
              </Link>
            </dd>
          </div>
        </dl>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            Artistas
          </h2>

          {evento.artists.length === 0 ? (
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Aún no hay artistas asociados a este evento.
            </p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-3">
              {evento.artists.map((artista) => (
                <li key={artista.id}>
                  <Link
                    to={crearRuta.detalleArtista(artista.id)}
                    className="inline-flex rounded-full border border-violet-300 px-4 py-2 font-semibold text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-950"
                  >
                    {artista.stageName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </section>
  )
}