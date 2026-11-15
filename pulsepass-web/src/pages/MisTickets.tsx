import { useState } from 'react'
import { Link } from 'react-router'
import clsx from 'clsx'
import { Boton } from '../componentes/Boton'
import { Modal } from '../componentes/Modal'
import { useAuth } from '../funcionalidades/auth/useAuth'
import {
  useCancelarTicket,
  useMisTickets,
} from '../funcionalidades/tickets/consultas'
import type { EstadoTicket, Ticket } from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import {
  formatearFechaCompra,
  formatearPrecioCOP,
  obtenerEtiquetaEstadoTicket,
  obtenerEtiquetaTipoTicket,
} from '../lib/formatos'
import { crearRuta, RUTAS } from '../lib/rutas'

type FiltroTicket = 'TODOS' | 'PAID' | 'USED' | 'CANCELLED'

const filtros: Array<{
  valor: FiltroTicket
  etiqueta: string
}> = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'PAID', etiqueta: 'Pagados' },
  { valor: 'USED', etiqueta: 'Usados' },
  { valor: 'CANCELLED', etiqueta: 'Cancelados' },
]

const clasesEstado: Record<EstadoTicket, string> = {
  RESERVED: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  USED: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
}

interface ModalCancelacionProps {
  ticket: Ticket
  cargando: boolean
  mensajeError: string | null
  alCerrar: () => void
  alConfirmar: () => void
}

function ModalCancelacion({
  ticket,
  cargando,
  mensajeError,
  alCerrar,
  alConfirmar,
}: ModalCancelacionProps) {
  return (
    <Modal
      abierto
      titulo="Cancelar ticket"
      onCerrar={alCerrar}
      bloquearCierre={cargando}
      descripcionId="descripcion-cancelacion"
    >
      <p
        id="descripcion-cancelacion"
        className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
      >
        ¿Confirmas la cancelación del ticket{' '}
        <strong>{ticket.ticketCode}</strong> para{' '}
        <strong>{ticket.eventName}</strong>?
      </p>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Esta acción no se puede deshacer.
      </p>

      {mensajeError !== null && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {mensajeError}
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Boton
          type="button"
          variante="secundario"
          disabled={cargando}
          onClick={alCerrar}
        >
          Volver
        </Boton>

        <Boton
          type="button"
          variante="peligro"
          cargando={cargando}
          textoCargando="Cancelando…"
          onClick={alConfirmar}
        >
          Confirmar cancelación
        </Boton>
      </div>
    </Modal>
  )
}

export default function MisTickets() {
  const { sesion } = useAuth()
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''

  const consulta = useMisTickets(email)
  const cancelacion = useCancelarTicket(email)

  const [filtro, setFiltro] = useState<FiltroTicket>('TODOS')
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(
    null,
  )
  const [mensajeCancelacion, setMensajeCancelacion] = useState<string | null>(
    null,
  )

  const tickets = consulta.data ?? []
  const ticketsFiltrados =
    filtro === 'TODOS'
      ? tickets
      : tickets.filter((ticket) => ticket.status === filtro)

  const abrirCancelacion = (ticket: Ticket) => {
    setMensajeCancelacion(null)
    setTicketSeleccionado(ticket)
  }

  const cerrarCancelacion = () => {
    if (!cancelacion.isPending) {
      setMensajeCancelacion(null)
      setTicketSeleccionado(null)
    }
  }

  const confirmarCancelacion = async () => {
    if (ticketSeleccionado === null) {
      return
    }

    setMensajeCancelacion(null)

    try {
      await cancelacion.mutateAsync(ticketSeleccionado.ticketCode)
      setTicketSeleccionado(null)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        setMensajeCancelacion(
          'Este ticket ya no puede cancelarse. Actualiza la información e inténtalo nuevamente.',
        )
        return
      }

      setMensajeCancelacion(
        'No fue posible cancelar el ticket. Inténtalo nuevamente.',
      )
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
          PulsePass
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          Mis tickets
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Consulta tus entradas y revisa el estado de cada compra.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2" aria-label="Filtrar tickets">
        {filtros.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={filtro === opcion.valor}
            onClick={() => setFiltro(opcion.valor)}
            className={clsx(
              'min-h-11 rounded-full border px-5 py-2 text-sm font-semibold transition',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
              filtro === opcion.valor
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
            )}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      {consulta.isPending && (
        <div
          role="status"
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          Cargando tus tickets…
        </div>
      )}

      {consulta.isError && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950"
        >
          <h2 className="font-bold text-red-800 dark:text-red-200">
            No pudimos cargar tus tickets
          </h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            Comprueba tu conexión e inténtalo nuevamente.
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

      {!consulta.isPending && !consulta.isError && tickets.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Aún no tienes tickets
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Explora la cartelera y encuentra tu próximo evento.
          </p>
          <Link
            to={RUTAS.EVENTOS}
            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Ver eventos
          </Link>
        </div>
      )}

      {!consulta.isPending &&
        !consulta.isError &&
        tickets.length > 0 &&
        ticketsFiltrados.length === 0 && (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            No tienes tickets con este estado.
          </p>
        )}

      {!consulta.isPending &&
        !consulta.isError &&
        ticketsFiltrados.length > 0 && (
          <div className="mt-8 grid gap-5">
            {ticketsFiltrados.map((ticket) => (
              <article
                key={ticket.ticketCode}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                        {ticket.eventName}
                      </h2>
                      <span
                        className={clsx(
                          'rounded-full px-3 py-1 text-xs font-bold',
                          clasesEstado[ticket.status],
                        )}
                      >
                        {obtenerEtiquetaEstadoTicket(ticket.status)}
                      </span>
                    </div>

                    <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <dt className="text-slate-500 dark:text-slate-400">
                          Código
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                          {ticket.ticketCode}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 dark:text-slate-400">
                          Tipo
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                          {obtenerEtiquetaTipoTicket(ticket.type)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 dark:text-slate-400">
                          Precio
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                          {formatearPrecioCOP(ticket.price)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 dark:text-slate-400">
                          Compra
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                          {formatearFechaCompra(ticket.purchaseDate)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-shrink-0">
                    <Link
                      to={crearRuta.detalleTicket(ticket.ticketCode)}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Ver detalle
                    </Link>

                    {ticket.status === 'PAID' && (
                      <Boton
                        type="button"
                        variante="peligro"
                        onClick={() => abrirCancelacion(ticket)}
                      >
                        Cancelar
                      </Boton>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      {ticketSeleccionado !== null && (
        <ModalCancelacion
          ticket={ticketSeleccionado}
          cargando={cancelacion.isPending}
          mensajeError={mensajeCancelacion}
          alCerrar={cerrarCancelacion}
          alConfirmar={() => {
            void confirmarCancelacion()
          }}
        />
      )}
    </section>
  )
}
