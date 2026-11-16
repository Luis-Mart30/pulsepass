import '../componentes/ExperienciaPulsePass.css'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Boton } from '../componentes/Boton'
import { IconoDato } from '../componentes/IconoDato'
import { Tabla } from '../componentes/Tabla'
import {
  useMarcarTicketUsado,
  useTicketsPagados,
} from '../funcionalidades/tickets/consultas'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import {
  formatearFechaCompra,
  formatearPrecioCOP,
  obtenerEtiquetaEstadoTicket,
  obtenerEtiquetaTipoTicket,
} from '../lib/formatos'
import { RUTAS, SECCION_TICKETS_PAGADOS } from '../lib/rutas'

export default function TicketsPagadosEvento() {
  const { eventCode = '' } = useParams()
  const consulta = useTicketsPagados(eventCode)
  const uso = useMarcarTicketUsado(eventCode)

  const [ticketsValidados, setTicketsValidados] = useState<Set<string>>(
    () => new Set(),
  )
  const [codigoProcesando, setCodigoProcesando] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const tickets = (consulta.data ?? []).filter(
    (ticket) => !ticketsValidados.has(ticket.ticketCode),
  )

  const nombreEvento =
    consulta.data !== undefined && consulta.data.length > 0
      ? consulta.data[0]!.eventName
      : eventCode

  const validarTicket = async (ticketCode: string) => {
    setCodigoProcesando(ticketCode)
    setMensajeExito(null)
    setMensajeError(null)

    try {
      await uso.mutateAsync(ticketCode)

      setTicketsValidados((actuales) => {
        const nuevos = new Set(actuales)
        nuevos.add(ticketCode)
        return nuevos
      })

      setMensajeExito(`Ticket ${ticketCode} validado correctamente.`)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        setMensajeError(
          'El ticket ya fue utilizado o su estado cambió. Actualiza la lista antes de continuar.',
        )
      } else {
        setMensajeError(
          'No fue posible validar el ticket. Inténtalo nuevamente.',
        )
      }
    } finally {
      setCodigoProcesando(null)
    }
  }

  const botonValidar = (ticket: Ticket) => (
    <Boton
      type="button"
      className="panel-accion-staff w-full"
      cargando={codigoProcesando === ticket.ticketCode}
      textoCargando="Validando…"
      disabled={codigoProcesando !== null}
      aria-label={`Validar ingreso de ${ticket.ticketCode}`}
      onClick={() => void validarTicket(ticket.ticketCode)}
    >
      Validar ingreso
    </Boton>
  )

  return (
    <section className="panel-staff mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="encabezado-gestion encabezado-staff flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="operacion-rol text-sm font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
            Acceso STAFF
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl dark:text-white">
            Tickets pagados
          </h1>
          <p className="mt-3 wrap-anywhere text-slate-600 dark:text-slate-300">
            Evento:{' '}
            <strong className="text-slate-950 dark:text-white">
              {nombreEvento}
            </strong>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Link
            to={RUTAS.STAFF_VALIDACION}
            className="panel-enlace inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold focus-visible:outline-2"
          >
            <IconoDato tipo="entrada" />
            Validar por código
          </Link>
          <Link
            to={`${RUTAS.STAFF_VALIDACION}#${SECCION_TICKETS_PAGADOS}`}
            className="panel-enlace inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold focus-visible:outline-2"
          >
            Cambiar evento
          </Link>
        </div>
      </header>

      {consulta.isPending && (
        <div
          role="status"
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          Cargando tickets pagados…
        </div>
      )}

      {consulta.isError && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950"
        >
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200">
            No pudimos consultar los tickets
          </h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            Verifica el código del evento y vuelve a intentarlo.
          </p>
          <Boton
            type="button"
            variante="secundario"
            className="mt-4"
            onClick={() => void consulta.refetch()}
          >
            Reintentar
          </Boton>
        </div>
      )}

      {mensajeExito !== null && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {mensajeExito}
        </div>
      )}

      {mensajeError !== null && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {mensajeError}
        </div>
      )}

      {!consulta.isPending && !consulta.isError && tickets.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            No hay tickets pagados pendientes
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            No existen entradas pagadas por validar para este evento.
          </p>
        </div>
      )}

      {!consulta.isPending && !consulta.isError && tickets.length > 0 && (
        <>
          <div className="panel-contador mt-8 rounded-xl px-5 py-4">
            <p className="panel-titulo font-semibold tabular-nums">
              <IconoDato tipo="entrada" />
              Pendientes de validación: {tickets.length}
            </p>
          </div>

          <div className="panel-tabla tarjeta-operacion mt-5 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block dark:border-slate-800 dark:bg-slate-900">
            <Tabla
              etiqueta="Tickets pagados pendientes"
              filas={tickets}
              claveFila={(ticket) => ticket.ticketCode}
              columnas={[
                {
                  titulo: 'Código',
                  contenido: (ticket) => <code>{ticket.ticketCode}</code>,
                },
                {
                  titulo: 'Tipo',
                  contenido: (ticket) => obtenerEtiquetaTipoTicket(ticket.type),
                },
                { titulo: 'Titular', contenido: (ticket) => ticket.userEmail },
                {
                  titulo: 'Precio',
                  contenido: (ticket) => formatearPrecioCOP(ticket.price),
                },
                {
                  titulo: 'Estado',
                  contenido: (ticket) => (
                    <span className="panel-estado-pagado">
                      {obtenerEtiquetaEstadoTicket(ticket.status)}
                    </span>
                  ),
                },
                { titulo: 'Acción', contenido: botonValidar },
              ]}
            />
          </div>
          <div
            role="region"
            aria-label="Tarjetas de tickets pagados"
            className="mt-5 grid gap-5 md:hidden"
          >
            {tickets.map((ticket) => (
              <article
                key={ticket.ticketCode}
                className="panel-operativo rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-6">
                  <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-slate-500 dark:text-slate-400">
                        Código
                      </dt>
                      <dd className="mt-1 font-bold break-all text-slate-950 dark:text-white">
                        {ticket.ticketCode}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-slate-500 dark:text-slate-400">
                        Titular
                      </dt>
                      <dd className="mt-1 font-semibold break-all text-slate-950 dark:text-white">
                        {ticket.userEmail}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-slate-500 dark:text-slate-400">
                        Tipo y precio
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                        {obtenerEtiquetaTipoTicket(ticket.type)}
                        {' · '}
                        {formatearPrecioCOP(ticket.price)}
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
                        Compra
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                        {formatearFechaCompra(ticket.purchaseDate)}
                      </dd>
                    </div>
                  </dl>

                  {botonValidar(ticket)}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
