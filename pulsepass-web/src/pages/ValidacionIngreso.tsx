import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Boton } from '../componentes/Boton'
import {
  useMarcarTicketUsado,
  useTicket,
} from '../funcionalidades/tickets/consultas'
import {
  ValidacionIngresoSchema,
  type Ticket,
  type ValidacionIngresoDatos,
} from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import {
  formatearPrecioCOP,
  obtenerEtiquetaEstadoTicket,
  obtenerEtiquetaTipoTicket,
} from '../lib/formatos'

export default function ValidacionIngreso() {
  const [codigoConsultado, setCodigoConsultado] = useState('')
  const [errorValidacion, setErrorValidacion] = useState<{
    mensaje: string
    tipo: 'advertencia' | 'error'
  } | null>(null)
  const [ticketValidado, setTicketValidado] = useState<Ticket | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<ValidacionIngresoDatos>({
    resolver: zodResolver(ValidacionIngresoSchema),
    defaultValues: { ticketCode: '' },
  })

  const consulta = useTicket(codigoConsultado)
  const ticketActual = ticketValidado ?? consulta.data
  const uso = useMarcarTicketUsado(ticketActual?.eventCode ?? '')

  const buscarTicket = (datos: ValidacionIngresoDatos) => {
    setErrorValidacion(null)
    setTicketValidado(null)
    uso.reset()

    if (datos.ticketCode === codigoConsultado) {
      void consulta.refetch()
      return
    }

    setCodigoConsultado(datos.ticketCode)
  }

  const validarIngreso = async () => {
    if (ticketActual === undefined) {
      return
    }

    setErrorValidacion(null)

    try {
      const actualizado = await uso.mutateAsync(ticketActual.ticketCode)
      setTicketValidado(actualizado)
      setValue('ticketCode', '')
      setFocus('ticketCode')
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        setErrorValidacion({
          mensaje:
            error.message.trim().length > 0
              ? error.message
              : 'El ticket ya fue utilizado o su estado cambió.',
          tipo: 'advertencia',
        })
        return
      }

      setErrorValidacion({
        mensaje:
          error instanceof ApiError && error.status === 403
            ? 'Sin permisos para validar este ticket.'
            : 'No fue posible validar el ingreso. Inténtalo nuevamente.',
        tipo: 'error',
      })
    }
  }

  const ticketPagado = ticketActual?.status === 'PAID'
  const ticketUsado = ticketActual?.status === 'USED'
  const ticketCancelado = ticketActual?.status === 'CANCELLED'
  const ticketReservado = ticketActual?.status === 'RESERVED'

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
          Acceso STAFF
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          Validación de ingreso
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Ingresa el código de una entrada para comprobar su estado antes de
          permitir el acceso.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(buscarTicket)}
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        noValidate
      >
        <label
          htmlFor="codigo-ticket"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          Código del ticket
        </label>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="codigo-ticket"
            type="text"
            placeholder="Ejemplo: TKT-ABC-123"
            autoComplete="off"
            autoFocus
            aria-invalid={errors.ticketCode !== undefined}
            aria-describedby={
              errors.ticketCode === undefined
                ? undefined
                : 'codigo-ticket-error'
            }
            {...register('ticketCode', {
              onChange: () => setErrorValidacion(null),
            })}
            className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-950"
          />

          <Boton type="submit">Buscar ticket</Boton>
        </div>

        {errors.ticketCode?.message !== undefined ? (
          <p
            id="codigo-ticket-error"
            role="alert"
            className="mt-2 text-sm text-red-600 dark:text-red-400"
          >
            {errors.ticketCode.message}
          </p>
        ) : null}
      </form>

      {codigoConsultado.length > 0 && consulta.isPending && (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          Consultando el ticket…
        </div>
      )}

      {codigoConsultado.length > 0 && consulta.isError && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950"
        >
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200">
            {consulta.error instanceof ApiError && consulta.error.status === 404
              ? 'Ticket no encontrado'
              : consulta.error instanceof ApiError &&
                  consulta.error.status === 403
                ? 'Sin permisos'
                : 'No pudimos consultar el ticket'}
          </h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {consulta.error instanceof ApiError && consulta.error.status === 404
              ? 'Verifica el código e inténtalo nuevamente.'
              : consulta.error instanceof ApiError &&
                  consulta.error.status === 403
                ? 'No tienes permisos para consultar este ticket.'
                : 'Comprueba la conexión y vuelve a intentarlo.'}
          </p>
        </div>
      )}

      {ticketActual !== undefined &&
        !consulta.isPending &&
        !consulta.isError && (
          <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <header
              className={
                ticketPagado
                  ? 'bg-emerald-600 p-6 text-white'
                  : ticketUsado
                    ? 'bg-slate-600 p-6 text-white'
                    : 'bg-red-600 p-6 text-white'
              }
            >
              <p className="text-sm font-semibold tracking-wider uppercase opacity-90">
                Resultado de validación
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {ticketPagado && 'Entrada válida'}
                {ticketUsado && 'Entrada ya utilizada'}
                {ticketCancelado && 'Entrada cancelada'}
                {ticketReservado && 'Entrada no pagada'}
              </h2>
            </header>

            <div className="p-6">
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">
                    Evento
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                    {ticketActual.eventName}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">
                    Código
                  </dt>
                  <dd className="mt-1 font-semibold break-all text-slate-950 dark:text-white">
                    {ticketActual.ticketCode}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">
                    Titular
                  </dt>
                  <dd className="mt-1 font-semibold break-all text-slate-950 dark:text-white">
                    {ticketActual.userEmail}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">
                    Tipo
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                    {obtenerEtiquetaTipoTicket(ticketActual.type)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">
                    Precio
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                    {formatearPrecioCOP(ticketActual.price)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">
                    Estado
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                    {obtenerEtiquetaEstadoTicket(ticketActual.status)}
                  </dd>
                </div>
              </dl>

              {ticketPagado && (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                    El ticket está pagado y puede validarse.
                  </p>
                  <Boton
                    type="button"
                    className="mt-4 w-full sm:w-auto"
                    cargando={uso.isPending}
                    textoCargando="Validando ingreso…"
                    onClick={() => {
                      void validarIngreso()
                    }}
                  >
                    Marcar como usado
                  </Boton>
                </div>
              )}

              {ticketUsado && (
                <div
                  role="status"
                  className="mt-6 rounded-xl border border-slate-300 bg-slate-100 p-5 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {ticketValidado !== null
                    ? 'Ingreso validado correctamente.'
                    : 'Este ticket ya fue utilizado anteriormente.'}
                </div>
              )}

              {ticketCancelado && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 font-semibold text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
                >
                  No permitas el ingreso: este ticket está cancelado.
                </div>
              )}

              {ticketReservado && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
                >
                  No permitas el ingreso: este ticket todavía no está pagado.
                </div>
              )}

              {errorValidacion !== null && (
                <div
                  role="alert"
                  className={
                    errorValidacion.tipo === 'advertencia'
                      ? 'mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'
                      : 'mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
                  }
                >
                  {errorValidacion.mensaje}
                </div>
              )}
            </div>
          </article>
        )}
    </section>
  )
}
