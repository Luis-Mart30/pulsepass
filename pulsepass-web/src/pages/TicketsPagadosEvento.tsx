import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Boton } from '../componentes/Boton'
import {
  useMarcarTicketUsado,
  useTicketsPagados,
} from '../funcionalidades/tickets/consultas'
import { ApiError } from '../lib/http'
import {
  formatearFechaCompra,
  formatearPrecioCOP,
  obtenerEtiquetaTipoTicket,
} from '../lib/formatos'
import { RUTAS } from '../lib/rutas'

export default function TicketsPagadosEvento() {
  const { eventCode = '' } = useParams()
  const consulta = useTicketsPagados(eventCode)
  const uso = useMarcarTicketUsado(eventCode)

  const [ticketsValidados, setTicketsValidados] =
    useState<Set<string>>(() => new Set())
  const [codigoProcesando, setCodigoProcesando] =
    useState<string | null>(null)
  const [mensajeExito, setMensajeExito] =
    useState<string | null>(null)
  const [mensajeError, setMensajeError] =
    useState<string | null>(null)

  const tickets = (consulta.data ?? []).filter(
    (ticket) => !ticketsValidados.has(ticket.ticketCode),
  )

  const nombreEvento =
    consulta.data !== undefined &&
    consulta.data.length > 0
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

      setMensajeExito(
        `Ticket ${ticketCode} validado correctamente.`,
      )
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

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Acceso STAFF
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            Tickets pagados
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Evento:{' '}
            <strong className="text-slate-950 dark:text-white">
              {nombreEvento}
            </strong>
          </p>
        </div>

        <Link
          to={RUTAS.STAFF_VALIDACION}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Validar por código
        </Link>
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

      {!consulta.isPending &&
        !consulta.isError &&
        tickets.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              No hay tickets pagados pendientes
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              No existen entradas pagadas por validar para este
              evento.
            </p>
          </div>
        )}

      {!consulta.isPending &&
        !consulta.isError &&
        tickets.length > 0 && (
          <>
            <div className="mt-8 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4 dark:border-indigo-900 dark:bg-indigo-950">
              <p className="font-semibold text-indigo-800 dark:text-indigo-200">
                Pendientes de validación: {tickets.length}
              </p>
            </div>

            <div className="mt-5 grid gap-5">
              {tickets.map((ticket) => (
                <article
                  key={ticket.ticketCode}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <dl className="grid min-w-0 flex-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <dt className="text-sm text-slate-500 dark:text-slate-400">
                          Código
                        </dt>
                        <dd className="mt-1 break-all font-bold text-slate-950 dark:text-white">
                          {ticket.ticketCode}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm text-slate-500 dark:text-slate-400">
                          Titular
                        </dt>
                        <dd className="mt-1 break-all font-semibold text-slate-950 dark:text-white">
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
                          Compra
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                          {formatearFechaCompra(
                            ticket.purchaseDate,
                          )}
                        </dd>
                      </div>
                    </dl>

                    <Boton
                      type="button"
                      className="w-full lg:w-auto lg:flex-shrink-0"
                      cargando={
                        codigoProcesando === ticket.ticketCode
                      }
                      textoCargando="Validando…"
                      disabled={
                        codigoProcesando !== null &&
                        codigoProcesando !== ticket.ticketCode
                      }
                      aria-label={`Validar ingreso de ${ticket.ticketCode}`}
                      onClick={() => {
                        void validarTicket(ticket.ticketCode)
                      }}
                    >
                      Validar ingreso
                    </Boton>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
    </section>
  )
}