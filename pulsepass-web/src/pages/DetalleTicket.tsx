import '../componentes/ExperienciaPulsePass.css'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import clsx from 'clsx'
import { Boton } from '../componentes/Boton'
import { Modal } from '../componentes/Modal'
import { useAuth } from '../funcionalidades/auth/useAuth'
import {
  useCancelarTicket,
  useTicket,
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
import './Entradas.css'
import { IconoDato } from '../componentes/IconoDato'

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
      descripcionId="descripcion-cancelacion-detalle"
    >
      <p
        id="descripcion-cancelacion-detalle"
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

export default function DetalleTicket() {
  const { ticketCode = '' } = useParams()
  const { sesion } = useAuth()

  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''

  const consulta = useTicket(ticketCode)
  const cancelacion = useCancelarTicket(email)

  const [copiado, setCopiado] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [mensajeCancelacion, setMensajeCancelacion] = useState<string | null>(
    null,
  )

  const copiarCodigo = async () => {
    if (consulta.data === undefined) {
      return
    }

    try {
      await window.navigator.clipboard.writeText(consulta.data.ticketCode)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2_000)
    } catch {
      setCopiado(false)
    }
  }

  const abrirCancelacion = () => {
    setMensajeCancelacion(null)
    setModalAbierto(true)
  }

  const cerrarCancelacion = () => {
    if (!cancelacion.isPending) {
      setMensajeCancelacion(null)
      setModalAbierto(false)
    }
  }

  const confirmarCancelacion = async () => {
    if (consulta.data === undefined) {
      return
    }

    setMensajeCancelacion(null)

    try {
      await cancelacion.mutateAsync(consulta.data.ticketCode)
      setModalAbierto(false)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        setMensajeCancelacion(error.message)
        return
      }

      setMensajeCancelacion(
        'No fue posible cancelar el ticket. Inténtalo nuevamente.',
      )
    }
  }

  if (consulta.isPending) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          role="status"
          className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          Cargando el ticket…
        </div>
      </section>
    )
  }

  if (consulta.isError || consulta.data === undefined) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          role="alert"
          className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900"
        >
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Ticket no disponible
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-300">
            No pudimos encontrar este ticket o no tienes permiso para
            consultarlo.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Boton
              type="button"
              variante="secundario"
              onClick={() => void consulta.refetch()}
            >
              Reintentar
            </Boton>

            <Link
              to={RUTAS.MIS_TICKETS}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Volver a mis tickets
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const ticket = consulta.data

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to={RUTAS.MIS_TICKETS}
        className="inline-flex min-h-11 items-center font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-indigo-400"
      >
        ← Volver a mis tickets
      </Link>

      <article className="tarjeta-operacion mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <header className="entrada-cabecera p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wider text-indigo-100 uppercase">
                Entrada PulsePass
              </p>
              <h1 className="titulo-pulsepass mt-2 text-3xl font-extrabold">
                {ticket.eventName}
              </h1>
            </div>

            <span
              className={clsx(
                'w-fit rounded-full px-4 py-2 text-sm font-bold',
                clasesEstado[ticket.status],
              )}
            >
              {obtenerEtiquetaEstadoTicket(ticket.status)}
            </span>
          </div>
        </header>

        <div className="entrada-talon p-6 sm:p-8">
          <section
            aria-labelledby="titulo-codigo-ticket"
            className="entrada-codigo rounded-2xl border p-4 sm:p-5"
          >
            <h2
              id="titulo-codigo-ticket"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300"
            >
              <IconoDato tipo="codigo" />
              Código del ticket
            </h2>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <strong className="font-mono text-xl break-all text-slate-950 dark:text-white">
                {ticket.ticketCode}
              </strong>

              <Boton
                type="button"
                variante="secundario"
                onClick={() => void copiarCodigo()}
              >
                {copiado ? 'Código copiado' : 'Copiar código'}
              </Boton>
            </div>
            {ticket.status === 'PAID' && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Presenta este código al ingresar al evento.
              </p>
            )}
          </section>

          <dl className="entrada-datos mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                <IconoDato tipo="entrada" />
                Tipo de entrada
              </dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                {obtenerEtiquetaTipoTicket(ticket.type)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                <IconoDato tipo="precio" />
                Precio
              </dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                {formatearPrecioCOP(ticket.price)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                <IconoDato tipo="fecha" />
                Fecha de compra
              </dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                {formatearFechaCompra(ticket.purchaseDate)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                <IconoDato tipo="edad" />
                Correo del titular
              </dt>
              <dd className="mt-1 text-lg font-semibold break-all text-slate-950 dark:text-white">
                {ticket.userEmail}
              </dd>
            </div>
          </dl>

          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
            <Link
              to={crearRuta.detalleEvento(ticket.eventCode)}
              className="inline-flex min-h-11 items-center font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-indigo-400"
            >
              Ver detalles del evento
            </Link>
          </div>

          {ticket.status === 'PAID' && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/40">
              <h2 className="font-bold text-red-800 dark:text-red-200">
                Cancelación
              </h2>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                Puedes cancelar este ticket mientras conserve el estado pagado.
              </p>
              <Boton
                type="button"
                variante="peligro"
                className="mt-4"
                onClick={abrirCancelacion}
              >
                Cancelar ticket
              </Boton>
            </div>
          )}
        </div>
      </article>

      {modalAbierto && (
        <ModalCancelacion
          ticket={ticket}
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
