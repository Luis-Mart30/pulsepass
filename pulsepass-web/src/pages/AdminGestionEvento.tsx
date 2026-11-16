import '../componentes/ExperienciaPulsePass.css'
import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { Boton } from '../componentes/Boton'
import { IconoDato } from '../componentes/IconoDato'
import { Modal } from '../componentes/Modal'
import { useArtistasActivos } from '../funcionalidades/artistas/consultas'
import {
  useAgregarArtistaAEvento,
  useEventoPorCodigo,
  usePublicarEvento,
} from '../funcionalidades/eventos/consultas'
import type { EstadoEvento } from '../funcionalidades/eventos/tipos'
import { formatearFechaEvento, obtenerEtiquetaCategoria } from '../lib/formatos'
import { ApiError } from '../lib/http'
import { crearRuta, RUTAS } from '../lib/rutas'

const ETIQUETAS_ESTADO: Record<EstadoEvento, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  SOLD_OUT: 'Agotado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
}

interface EstadoNavegacion {
  creado?: boolean
}

export default function AdminGestionEvento() {
  const { eventCode = '' } = useParams()
  const location = useLocation()
  const evento = useEventoPorCodigo(eventCode)
  const artistas = useArtistasActivos()
  const agregarArtista = useAgregarArtistaAEvento()
  const publicar = usePublicarEvento()

  const [artistaId, setArtistaId] = useState('')
  const [confirmarPublicacion, setConfirmarPublicacion] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(
    (location.state as EstadoNavegacion | null)?.creado === true
      ? 'El evento fue creado como borrador.'
      : null,
  )
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const artistasDisponibles = useMemo(() => {
    const asociados = new Set(
      evento.data?.artists.map((artista) => artista.id) ?? [],
    )

    return (artistas.data ?? []).filter((artista) => !asociados.has(artista.id))
  }, [artistas.data, evento.data?.artists])

  const asociarArtista = async (): Promise<void> => {
    const id = Number(artistaId)

    if (!Number.isInteger(id) || id <= 0) {
      setErrorAccion('Selecciona un artista para continuar.')
      return
    }

    setErrorAccion(null)
    setMensaje(null)

    try {
      await agregarArtista.mutateAsync({
        codigo: eventCode,
        artistaId: id,
      })
      setArtistaId('')
      setMensaje('Artista asociado correctamente.')
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        setErrorAccion(error.message)
        return
      }

      setErrorAccion('No fue posible asociar el artista. Inténtalo nuevamente.')
    }
  }

  const publicarEvento = async (): Promise<void> => {
    setErrorAccion(null)
    setMensaje(null)

    try {
      await publicar.mutateAsync(eventCode)
      setConfirmarPublicacion(false)
      setMensaje('Evento publicado correctamente.')
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        setErrorAccion(error.message)
        return
      }

      setErrorAccion('No fue posible publicar el evento. Inténtalo nuevamente.')
    }
  }

  if (evento.isPending) {
    return (
      <p role="status" className="mx-auto max-w-6xl px-4 py-10">
        Cargando evento...
      </p>
    )
  }

  if (evento.isError || evento.data === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <section
          role="alert"
          className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <p>No fue posible cargar el evento solicitado.</p>
          <button
            type="button"
            onClick={() => void evento.refetch()}
            className="mt-4 min-h-11 rounded-lg bg-red-700 px-5 py-2.5 font-semibold text-white"
          >
            Reintentar
          </button>
        </section>
      </div>
    )
  }

  const datos = evento.data
  const puedePublicar = datos.status === 'DRAFT'

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="encabezado-gestion flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <Link
            to={RUTAS.ADMIN_EVENTOS}
            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Volver a eventos
          </Link>
          <p className="operacion-rol mt-6 font-semibold tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            Gestión administrativa
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl dark:text-white">
            {datos.name}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Código: {datos.eventCode}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <span className="w-fit rounded-full bg-indigo-100 px-4 py-2 font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            {ETIQUETAS_ESTADO[datos.status]}
          </span>
          <Link
            to={crearRuta.ticketsPagadosEvento(datos.eventCode)}
            className="panel-enlace inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold focus-visible:outline-2"
          >
            <IconoDato tipo="entrada" />
            Ver tickets pagados
          </Link>
        </div>
      </header>

      {mensaje !== null ? (
        <div
          role="status"
          className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {mensaje}
        </div>
      ) : null}

      {errorAccion !== null && !confirmarPublicacion ? (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {errorAccion}
        </div>
      ) : null}

      <section
        aria-label="Información del evento"
        className="panel-operativo tarjeta-operacion mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <dl className="panel-ficha grid gap-3 sm:grid-cols-2">
          <div>
            <dt>
              <IconoDato tipo="fecha" /> Fecha
            </dt>
            <dd>
              <time dateTime={datos.eventDate}>
                {formatearFechaEvento(datos.eventDate).replace(
                  /([ap]\.)\s+(m\.)$/,
                  '$1\u00a0$2',
                )}
              </time>
            </dd>
          </div>
          <div>
            <dt>
              <IconoDato tipo="lugar" /> Sede
            </dt>
            <dd>{datos.venueName}</dd>
          </div>
          <div>
            <dt>
              <IconoDato tipo="precio" /> Categoría
            </dt>
            <dd>{obtenerEtiquetaCategoria(datos.category)}</dd>
          </div>
          <div>
            <dt>
              <IconoDato tipo="edad" /> Edad mínima
            </dt>
            <dd>{datos.minimumAge} años</dd>
          </div>
          <div className="sm:col-span-2">
            <dt>Descripción</dt>
            <dd className="whitespace-pre-wrap">
              {datos.description ?? 'Sin descripción.'}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="panel-operativo rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="panel-titulo text-xl font-bold text-slate-950 dark:text-white">
            <IconoDato tipo="edad" />
            Artistas del evento
          </h2>

          {datos.artists.length === 0 ? (
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Todavía no hay artistas asociados.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {datos.artists.map((artista) => (
                <li
                  key={artista.id}
                  className="panel-superficie rounded-xl border p-4"
                >
                  <p className="font-semibold text-slate-950 dark:text-white">
                    {artista.stageName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {artista.genre} · {artista.country}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 space-y-3">
            <label
              htmlFor="artista"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Agregar artista
            </label>
            <select
              id="artista"
              value={artistaId}
              onChange={(event) => setArtistaId(event.target.value)}
              disabled={
                artistas.isPending ||
                artistas.isError ||
                artistasDisponibles.length === 0
              }
              className="selector-pulsepass min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">
                {artistas.isPending
                  ? 'Cargando artistas...'
                  : 'Selecciona un artista'}
              </option>
              {artistasDisponibles.map((artista) => (
                <option key={artista.id} value={String(artista.id)}>
                  {artista.stageName}
                </option>
              ))}
            </select>

            <Boton
              type="button"
              cargando={agregarArtista.isPending}
              textoCargando="Asociando..."
              disabled={
                artistaId.length === 0 || artistasDisponibles.length === 0
              }
              onClick={() => void asociarArtista()}
              className="w-full"
            >
              Asociar artista
            </Boton>
          </div>
        </section>

        <section className="panel-operativo rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="panel-titulo text-xl font-bold text-slate-950 dark:text-white">
            <IconoDato tipo="entrada" />
            Publicación
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Al publicar, el evento quedará visible en el catálogo público.
          </p>

          {!puedePublicar ? (
            <p className="mt-5 rounded-lg bg-slate-100 p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              Este evento ya no se encuentra en estado borrador.
            </p>
          ) : null}

          <Boton
            type="button"
            disabled={!puedePublicar}
            onClick={() => {
              setErrorAccion(null)
              setConfirmarPublicacion(true)
            }}
            className="mt-6 w-full"
          >
            Publicar evento
          </Boton>
        </section>
      </div>

      {confirmarPublicacion ? (
        <Modal
          abierto
          titulo="¿Publicar este evento?"
          onCerrar={() => setConfirmarPublicacion(false)}
          bloquearCierre={publicar.isPending}
        >
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            El evento aparecerá inmediatamente en el catálogo público.
          </p>

          {errorAccion !== null && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
            >
              {errorAccion}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Boton
              type="button"
              variante="secundario"
              disabled={publicar.isPending}
              onClick={() => setConfirmarPublicacion(false)}
            >
              Volver
            </Boton>
            <Boton
              type="button"
              cargando={publicar.isPending}
              textoCargando="Publicando..."
              onClick={() => void publicarEvento()}
            >
              Confirmar publicación
            </Boton>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
