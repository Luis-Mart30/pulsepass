import { Link } from 'react-router'
import type { ResumenEvento } from '../../funcionalidades/eventos/tipos'
import {
  formatearFechaEvento,
  obtenerEtiquetaCategoria,
} from '../../lib/formatos'
import { crearRuta } from '../../lib/rutas'
import { EstadoEventoEtiqueta } from './EstadoEventoEtiqueta'
import { PanelCategoriaEvento } from './PanelCategoriaEvento'
import './TarjetaEvento.css'
import { IconoDato } from '../IconoDato'

interface TarjetaEventoProps {
  evento: ResumenEvento
}

export function TarjetaEvento({ evento }: TarjetaEventoProps) {
  return (
    <article className="h-full">
      <Link
        to={crearRuta.detalleEvento(evento.eventCode)}
        aria-label={`Ver evento ${evento.name}`}
        className="evento-tarjeta h-full rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 motion-safe:transition motion-safe:hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-900"
      >
        <PanelCategoriaEvento categoria={evento.category} />

        <div className="evento-informacion flex min-w-0 flex-1 flex-col p-5">
          <p className="evento-categoria text-xs font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-200">
            {obtenerEtiquetaCategoria(evento.category)}
          </p>

          <EstadoEventoEtiqueta estado={evento.status} className="mt-2" />

          <h2 className="evento-nombre mt-2 font-bold text-slate-950 dark:text-white">
            {evento.name}
          </h2>

          <dl className="evento-datos text-sm">
            <div>
              <dt className="font-semibold text-slate-500 dark:text-slate-400">
                <IconoDato tipo="fecha" />
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
                <IconoDato tipo="lugar" />
                Lugar
              </dt>
              <dd className="mt-1 text-slate-700 dark:text-slate-200">
                {evento.venueName}
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-slate-500 dark:text-slate-400">
                <IconoDato tipo="edad" />
                Edad mínima
              </dt>
              <dd className="mt-1 text-slate-700 dark:text-slate-200">
                {evento.minimumAge === 0
                  ? 'Para todas las edades'
                  : `${evento.minimumAge} años`}
              </dd>
            </div>
          </dl>

          <span className="evento-accion mt-auto inline-flex w-fit rounded-lg bg-violet-700 px-4 py-2 font-semibold text-white transition">
            Ver evento
          </span>
        </div>
      </Link>
    </article>
  )
}
