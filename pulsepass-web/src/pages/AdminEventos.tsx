import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Boton } from '../componentes/Boton'
import {
  useEventoPorCodigo,
  useEventosCreadosEnSesion,
} from '../funcionalidades/eventos/consultas'
import type { EstadoEvento } from '../funcionalidades/eventos/tipos'
import { formatearFechaEvento, obtenerEtiquetaCategoria } from '../lib/formatos'
import { ApiError } from '../lib/http'
import { crearRuta, RUTAS } from '../lib/rutas'

const BusquedaEventoSchema = z.object({
  eventCode: z.string().trim().min(1, 'Ingresa el código del evento.'),
})

type BusquedaEventoDatos = z.infer<typeof BusquedaEventoSchema>

const ETIQUETAS_ESTADO: Record<EstadoEvento, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  SOLD_OUT: 'Agotado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
}

const CLASES_ESTADO: Record<EstadoEvento, string> = {
  DRAFT: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  PUBLISHED:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  SOLD_OUT:
    'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  FINISHED: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export default function AdminEventos() {
  const [codigoConsultado, setCodigoConsultado] = useState('')
  const consulta = useEventoPorCodigo(codigoConsultado)
  const eventosCreados = useEventosCreadosEnSesion()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusquedaEventoDatos>({
    resolver: zodResolver(BusquedaEventoSchema),
    defaultValues: { eventCode: '' },
  })

  const buscarEvento = (datos: BusquedaEventoDatos): void => {
    const codigo = datos.eventCode.trim()
    if (codigo === codigoConsultado) {
      void consulta.refetch()
      return
    }
    setCodigoConsultado(codigo)
  }

  const evento = consulta.data
  const noEncontrado =
    consulta.error instanceof ApiError && consulta.error.status === 404

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-semibold tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Panel administrativo
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            Administración de eventos
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Busca un evento por su código para consultar sus datos, asociar
            artistas o publicarlo.
          </p>
        </div>
        <Link
          to={RUTAS.ADMIN_CREAR_EVENTO}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Crear evento
        </Link>
      </header>

      <form
        onSubmit={handleSubmit(buscarEvento)}
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        noValidate
      >
        <label
          htmlFor="eventCode"
          className="block font-semibold text-slate-800 dark:text-slate-200"
        >
          Código del evento
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="eventCode"
            type="search"
            autoComplete="off"
            placeholder="Ejemplo: CMF-2026"
            aria-invalid={errors.eventCode !== undefined}
            aria-describedby={
              errors.eventCode === undefined ? undefined : 'eventCode-error'
            }
            className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 font-mono text-slate-950 transition outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            {...register('eventCode')}
          />
          <Boton type="submit" cargando={consulta.isFetching}>
            Buscar
          </Boton>
        </div>
        {errors.eventCode?.message !== undefined ? (
          <p
            id="eventCode-error"
            role="alert"
            className="mt-2 text-sm text-red-600 dark:text-red-400"
          >
            {errors.eventCode.message}
          </p>
        ) : null}
      </form>

      {consulta.isPending && codigoConsultado !== '' ? (
        <p role="status" className="mt-8 text-slate-600 dark:text-slate-300">
          Consultando evento…
        </p>
      ) : null}

      {consulta.isError ? (
        <section
          role="alert"
          className="mt-8 rounded-2xl border border-red-300 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <h2 className="font-bold">
            {noEncontrado
              ? 'Evento no encontrado'
              : 'No fue posible consultar el evento'}
          </h2>
          <p className="mt-2 text-sm">
            {noEncontrado
              ? 'Verifica el código e inténtalo nuevamente.'
              : 'Comprueba la conexión y vuelve a intentarlo.'}
          </p>
        </section>
      ) : null}

      {evento !== undefined && !consulta.isError ? (
        <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {evento.eventCode}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
                {evento.name}
              </h2>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${CLASES_ESTADO[evento.status]}`}
            >
              {ETIQUETAS_ESTADO[evento.status]}
            </span>
          </div>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Categoría</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {obtenerEtiquetaCategoria(evento.category)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Fecha</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {formatearFechaEvento(evento.eventDate)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Sede</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {evento.venueName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">
                Edad mínima
              </dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {evento.minimumAge === 0
                  ? 'Todas las edades'
                  : `${evento.minimumAge} años`}
              </dd>
            </div>
          </dl>

          <Link
            to={crearRuta.gestionEvento(evento.eventCode)}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-indigo-600 px-5 py-2.5 font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950"
          >
            Gestionar evento
          </Link>
        </article>
      ) : null}
      <section className="mt-8" aria-labelledby="eventos-creados">
        <h2
          id="eventos-creados"
          className="text-xl font-bold text-slate-950 dark:text-white"
        >
          Creados en esta sesión
        </h2>
        {eventosCreados.length === 0 ? (
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Aún no has creado eventos en esta sesión.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {eventosCreados.map((creado) => (
              <li
                key={creado.eventCode}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950 dark:text-white">
                    {creado.name}
                  </p>
                  <p className="text-sm break-all text-slate-600 dark:text-slate-300">
                    {creado.eventCode}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${CLASES_ESTADO[creado.status]}`}
                >
                  {ETIQUETAS_ESTADO[creado.status]}
                </span>
                <Link
                  to={crearRuta.gestionEvento(creado.eventCode)}
                  aria-label={`Gestionar ${creado.name} (${creado.eventCode})`}
                  className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-indigo-700 underline focus-visible:outline-2 dark:text-indigo-300"
                >
                  Gestionar evento
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Para consultar otros eventos, usa la búsqueda por código.
        </p>
      </section>
    </div>
  )
}
