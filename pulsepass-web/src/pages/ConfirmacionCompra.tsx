import '../componentes/ExperienciaPulsePass.css'
import { Link, useParams } from 'react-router'
import { useTicket } from '../funcionalidades/tickets/consultas'
import {
  formatearFechaCompra,
  formatearPrecioCOP,
  obtenerEtiquetaEstadoTicket,
  obtenerEtiquetaTipoTicket,
} from '../lib/formatos'
import { crearRuta, RUTAS } from '../lib/rutas'
import './Entradas.css'
import { IconoDato } from '../componentes/IconoDato'

export default function ConfirmacionCompra() {
  const { ticketCode = '' } = useParams()
  const consulta = useTicket(ticketCode)

  if (consulta.isPending) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          role="status"
          className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          Confirmando tu compra…
        </div>
      </section>
    )
  }

  if (consulta.isError || consulta.data === undefined) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          role="alert"
          className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900"
        >
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Confirmación no disponible
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            No pudimos consultar la información de esta compra.
          </p>
          <Link
            to={RUTAS.MIS_TICKETS}
            className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            Ir a mis tickets
          </Link>
        </div>
      </section>
    )
  }

  const ticket = consulta.data

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="tarjeta-operacion overflow-hidden rounded-3xl border border-emerald-200 bg-white dark:border-emerald-900 dark:bg-slate-900">
        <header className="entrada-cabecera-confirmacion p-6 text-center text-white sm:p-8">
          <div
            aria-hidden="true"
            className="entrada-sello mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl font-bold text-emerald-700"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              focusable="false"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>
          <h1 className="titulo-pulsepass mt-5 text-3xl font-extrabold">
            ¡Compra confirmada!
          </h1>
          <p className="mt-2 text-emerald-50">
            Tu entrada ya está disponible en PulsePass.
          </p>
        </header>

        <div className="entrada-talon p-6 sm:p-8">
          <h2 className="titulo-pulsepass text-2xl font-extrabold text-slate-950 dark:text-white">
            {ticket.eventName}
          </h2>

          <dl className="entrada-datos mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                <IconoDato tipo="codigo" />
                Código del ticket
              </dt>
              <dd className="mt-1 font-mono font-bold break-all text-slate-950 dark:text-white">
                {ticket.ticketCode}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                Estado
              </dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                {obtenerEtiquetaEstadoTicket(ticket.status)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                <IconoDato tipo="entrada" />
                Tipo
              </dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                {obtenerEtiquetaTipoTicket(ticket.type)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                <IconoDato tipo="precio" />
                Precio
              </dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                {formatearPrecioCOP(ticket.price)}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                <IconoDato tipo="fecha" />
                Fecha de compra
              </dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                {formatearFechaCompra(ticket.purchaseDate)}
              </dd>
            </div>
          </dl>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              to={crearRuta.detalleTicket(ticket.ticketCode)}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
            >
              Ver ticket
            </Link>

            <Link
              to={RUTAS.MIS_TICKETS}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Ver todos mis tickets
            </Link>

            <Link
              to={RUTAS.EVENTOS}
              className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 font-semibold text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:col-span-2 dark:text-violet-300"
            >
              Seguir explorando
            </Link>
          </div>
        </div>
      </article>
    </section>
  )
}
