import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useTodosLosEventos } from '../funcionalidades/eventos/consultas'
import type { EstadoEvento } from '../funcionalidades/eventos/tipos'
import {
  formatearFechaEvento,
  obtenerEtiquetaCategoria,
} from '../lib/formatos'
import { crearRuta, RUTAS } from '../lib/rutas'

const ESTADOS: Array<{
  valor: EstadoEvento
  etiqueta: string
}> = [
  { valor: 'DRAFT', etiqueta: 'Borrador' },
  { valor: 'PUBLISHED', etiqueta: 'Publicado' },
  { valor: 'SOLD_OUT', etiqueta: 'Agotado' },
  { valor: 'CANCELLED', etiqueta: 'Cancelado' },
  { valor: 'FINISHED', etiqueta: 'Finalizado' },
]

const ETIQUETAS_ESTADO: Record<EstadoEvento, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  SOLD_OUT: 'Agotado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
}

const CLASES_ESTADO: Record<EstadoEvento, string> = {
  DRAFT:
    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  PUBLISHED:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  SOLD_OUT:
    'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300',
  CANCELLED:
    'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  FINISHED:
    'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

type FiltroEstado = EstadoEvento | 'TODOS'

export default function AdminEventos() {
  const consulta = useTodosLosEventos()
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState<FiltroEstado>('TODOS')

  const eventosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')

    return (consulta.data ?? []).filter((evento) => {
      const coincideEstado =
        estado === 'TODOS' || evento.status === estado
      const coincideTexto =
        texto.length === 0 ||
        evento.name.toLocaleLowerCase('es').includes(texto) ||
        evento.eventCode.toLocaleLowerCase('es').includes(texto) ||
        evento.venueName.toLocaleLowerCase('es').includes(texto)

      return coincideEstado && coincideTexto
    })
  }, [busqueda, consulta.data, estado])

  const totalBorradores =
    consulta.data?.filter((evento) => evento.status === 'DRAFT')
      .length ?? 0

  const totalPublicados =
    consulta.data?.filter(
      (evento) => evento.status === 'PUBLISHED',
    ).length ?? 0

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Panel administrativo
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            Gestión de eventos
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Consulta todos los eventos, revisa su estado y accede a
            las opciones de administración.
          </p>
        </div>

        <Link
          to={RUTAS.ADMIN_CREAR_EVENTO}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Crear evento
        </Link>
      </header>

      <section
        aria-label="Resumen de eventos"
        className="mt-8 grid gap-4 sm:grid-cols-3"
      >
        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
            {consulta.data?.length ?? 0}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Borradores
          </p>
          <p className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {totalBorradores}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Publicados
          </p>
          <p className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalPublicados}
          </p>
        </article>
      </section>

      <section
        aria-label="Filtros de eventos"
        className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_14rem] dark:border-slate-800 dark:bg-slate-900"
      >
        <label className="grid gap-2 font-semibold text-slate-800 dark:text-slate-200">
          Buscar eventos
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Nombre, código o sede"
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label className="grid gap-2 font-semibold text-slate-800 dark:text-slate-200">
          Estado
          <select
            value={estado}
            onChange={(evento) =>
              setEstado(evento.target.value as FiltroEstado)
            }
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="TODOS">Todos</option>
            {ESTADOS.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </section>

      {consulta.isPending ? (
        <p role="status" className="mt-8 text-slate-600 dark:text-slate-300">
          Cargando eventos...
        </p>
      ) : null}

      {consulta.isError ? (
        <section
          role="alert"
          className="mt-8 rounded-2xl border border-red-300 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <p>No fue posible cargar los eventos.</p>
          <button
            type="button"
            onClick={() => void consulta.refetch()}
            className="mt-4 min-h-11 rounded-lg bg-red-700 px-5 py-2.5 font-semibold text-white hover:bg-red-800"
          >
            Reintentar
          </button>
        </section>
      ) : null}

      {consulta.isSuccess && eventosFiltrados.length === 0 ? (
        <p
          role="status"
          className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          No hay eventos que coincidan con los filtros.
        </p>
      ) : null}

      {consulta.isSuccess && eventosFiltrados.length > 0 ? (
        <section
          aria-label="Eventos administrables"
          className="mt-8 grid gap-5 lg:grid-cols-2"
        >
          {eventosFiltrados.map((evento) => (
            <article
              key={evento.eventCode}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
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

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    Categoría
                  </dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">
                    {obtenerEtiquetaCategoria(evento.category)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    Edad mínima
                  </dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">
                    {evento.minimumAge} años
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    Fecha
                  </dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">
                    {formatearFechaEvento(evento.eventDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    Sede
                  </dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">
                    {evento.venueName}
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
          ))}
        </section>
      ) : null}
    </main>
  )
}