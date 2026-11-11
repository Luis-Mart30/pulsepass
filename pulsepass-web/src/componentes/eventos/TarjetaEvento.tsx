import { Link } from 'react-router'
import type { ResumenEvento } from '../../funcionalidades/eventos/tipos'
import {
  formatearFechaEvento,
  obtenerEtiquetaCategoria,
} from '../../lib/formatos'
import { crearRuta } from '../../lib/rutas'

interface TarjetaEventoProps {
  evento: ResumenEvento
}

export function TarjetaEvento({
  evento,
}: TarjetaEventoProps) {
  return (
    <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-full flex-col p-6">
        <p className="text-sm font-semibold text-violet-600">
          {obtenerEtiquetaCategoria(evento.category)}
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
          {evento.name}
        </h2>

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-semibold text-slate-500 dark:text-slate-400">
              Fecha
            </dt>
            <dd className="mt-1 text-slate-700 dark:text-slate-200">
              <time dateTime={evento.eventDate}>
                {formatearFechaEvento(evento.eventDate)}
              </time>
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-500 dark:text-slate-400">
              Lugar
            </dt>
            <dd className="mt-1 text-slate-700 dark:text-slate-200">
              {evento.venueName}
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-500 dark:text-slate-400">
              Edad mínima
            </dt>
            <dd className="mt-1 text-slate-700 dark:text-slate-200">
              {evento.minimumAge === 0
                ? 'Para todas las edades'
                : `${evento.minimumAge} años`}
            </dd>
          </div>
        </dl>

        <Link
          to={crearRuta.detalleEvento(evento.eventCode)}
          className="mt-6 inline-flex w-fit rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        >
          Ver evento
        </Link>
      </div>
    </article>
  )
}