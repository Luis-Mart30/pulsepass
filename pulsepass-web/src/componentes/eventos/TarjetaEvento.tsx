import clsx from 'clsx'
import { Link } from 'react-router'
import type {
  CategoriaEvento,
  EstadoEvento,
  ResumenEvento,
} from '../../funcionalidades/eventos/tipos'
import {
  formatearFechaEvento,
  obtenerEtiquetaCategoria,
} from '../../lib/formatos'
import { crearRuta } from '../../lib/rutas'

const CATEGORIAS: Record<CategoriaEvento, { clases: string; icono: string }> = {
  MUSIC: {
    clases:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200',
    icono:
      'M9 18V5l12-2v13M9 18c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2ZM21 16c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2Z',
  },
  TECHNOLOGY: {
    clases: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    icono: 'M3 4h18v13H3zM12 17v4m-4 0h8',
  },
  SPORTS: {
    clases:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    icono: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0v18M3 12h18',
  },
  CULTURE: {
    clases: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    icono: 'm3 9 9-6 9 6M5 10h14M6 11v8m6-8v8m6-8v8M3 21h18',
  },
  EDUCATION: {
    clases: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
    icono: 'm2 10 10-5 10 5-10 5-10-5Zm4 2v5c4 3 8 3 12 0v-5m4-2v6',
  },
  ENTERTAINMENT: {
    clases:
      'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    icono:
      'm12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.5 6.3-.9L12 3Z',
  },
}

const CLASES_ESTADO: Record<EstadoEvento, string> = {
  DRAFT: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  PUBLISHED:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  SOLD_OUT: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  FINISHED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
}

interface TarjetaEventoProps {
  evento: ResumenEvento
}

export function TarjetaEvento({ evento }: TarjetaEventoProps) {
  const categoria = CATEGORIAS[evento.category]

  return (
    <article className="h-full">
      <Link
        to={crearRuta.detalleEvento(evento.eventCode)}
        aria-label={`Ver evento ${evento.name}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:border-slate-700 dark:bg-slate-900"
      >
        <div
          aria-hidden="true"
          className={clsx('grid min-h-28 place-items-center', categoria.clases)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
            className="size-9"
          >
            <path d={categoria.icono} />
          </svg>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-200">
            {obtenerEtiquetaCategoria(evento.category)}
          </p>

          <p
            className={clsx(
              'mt-2 w-fit rounded-full px-2.5 py-1 text-xs font-semibold',
              CLASES_ESTADO[evento.status],
            )}
          >
            {evento.status}
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
            {evento.name}
          </h2>

          <dl className="mt-4 mb-6 space-y-3 text-sm">
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

          <span className="mt-auto inline-flex w-fit rounded-lg bg-violet-700 px-4 py-2 font-semibold text-white transition">
            Ver evento
          </span>
        </div>
      </Link>
    </article>
  )
}
