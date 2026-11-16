import clsx from 'clsx'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { Boton } from '../componentes/Boton'
import { Modal } from '../componentes/Modal'
import { EstadoEventoEtiqueta } from '../componentes/eventos/EstadoEventoEtiqueta'
import { PanelCategoriaEvento } from '../componentes/eventos/PanelCategoriaEvento'
import { useAuth } from '../funcionalidades/auth/useAuth'
import { useEventoPorCodigo } from '../funcionalidades/eventos/consultas'
import { useComprarTicket } from '../funcionalidades/tickets/consultas'
import {
  CompraTicketSchema,
  type CompraTicketDatos,
  type TipoTicket,
} from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import {
  formatearFechaEvento,
  obtenerEtiquetaCategoria,
  obtenerEtiquetaTipoTicket,
} from '../lib/formatos'
import { crearRuta, RUTAS } from '../lib/rutas'
import '../componentes/ExperienciaPulsePass.css'
import './DetalleEvento.css'
import { IconoDato } from '../componentes/IconoDato'

const SeleccionEntradaSchema = CompraTicketSchema.pick({ type: true })

const opcionesTicket: Array<{
  tipo: TipoTicket
  nombre: string
  descripcion: string
}> = [
  {
    tipo: 'GENERAL',
    nombre: 'General',
    descripcion: 'Acceso general al evento.',
  },
  {
    tipo: 'VIP',
    nombre: 'VIP',
    descripcion: 'Experiencia preferencial.',
  },
  {
    tipo: 'BACKSTAGE',
    nombre: 'Backstage',
    descripcion: 'Acceso especial tras bambalinas.',
  },
  {
    tipo: 'STUDENT',
    nombre: 'Estudiante',
    descripcion: 'Entrada con tarifa estudiantil.',
  },
]

export default function DetalleEvento() {
  const { eventCode = '' } = useParams<{ eventCode: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { sesion, tieneRol } = useAuth()

  const consulta = useEventoPorCodigo(eventCode)
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''
  const compra = useComprarTicket(email)
  const puedeComprar =
    sesion.estado === 'autenticado' &&
    tieneRol('USER') &&
    !tieneRol('STAFF', 'ADMIN')
  const mostrarPanelCompra = sesion.estado === 'anonimo' || puedeComprar

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Pick<CompraTicketDatos, 'type'>>({
    resolver: zodResolver(SeleccionEntradaSchema),
    defaultValues: { type: 'GENERAL' },
  })
  const tipoSeleccionado = useWatch({ control, name: 'type' })
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false)
  const [errorCompra, setErrorCompra] = useState<string | null>(null)

  const abrirConfirmacion = () => {
    if (sesion.estado !== 'autenticado') {
      navigate(RUTAS.LOGIN, {
        state: {
          desde: `${location.pathname}${location.search}`,
        },
      })
      return
    }

    if (!puedeComprar) return

    setErrorCompra(null)
    setConfirmacionAbierta(true)
  }

  const comprarEntrada = handleSubmit(async ({ type }) => {
    if (sesion.estado !== 'autenticado' || !puedeComprar || compra.isPending) {
      return
    }

    setErrorCompra(null)
    try {
      const ticket = await compra.mutateAsync({
        userEmail: sesion.usuario.email,
        eventCode,
        type,
      })

      navigate(crearRuta.confirmacionCompra(ticket.ticketCode), {
        replace: true,
      })
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        setErrorCompra(error.message)
        return
      }

      setErrorCompra(
        error instanceof ApiError && error.status === 403
          ? 'No tienes permisos para comprar esta entrada.'
          : 'No fue posible completar la compra. Inténtalo nuevamente.',
      )
    }
  })

  if (consulta.isPending) {
    return (
      <section
        className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8"
        aria-live="polite"
      >
        <p className="text-slate-600 dark:text-slate-300">
          Cargando información del evento…
        </p>
      </section>
    )
  }

  if (consulta.isError) {
    const noDisponible =
      consulta.error instanceof ApiError &&
      (consulta.error.status === 403 || consulta.error.status === 404)

    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-titulo text-3xl font-extrabold text-slate-950 dark:text-white">
          {noDisponible
            ? 'Evento no disponible'
            : 'No pudimos cargar el evento'}
        </h1>
        <p role="alert" className="mt-4 text-slate-600 dark:text-slate-300">
          {noDisponible
            ? 'El evento solicitado no existe o no está disponible.'
            : 'Ocurrió un problema al consultar la información. Intenta nuevamente.'}
        </p>
        <Link
          to={RUTAS.EVENTOS}
          className="mt-6 inline-flex font-semibold text-violet-600 hover:text-violet-700"
        >
          Volver a eventos
        </Link>
      </section>
    )
  }

  const evento = consulta.data
  const compraDisponible = evento.status === 'PUBLISHED'

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        to={RUTAS.EVENTOS}
        className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-600 dark:text-violet-300 dark:hover:bg-slate-900"
      >
        ← Volver a eventos
      </Link>

      <div
        className={clsx(
          'mt-4 grid gap-5',
          mostrarPanelCompra &&
            'lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,1fr)] lg:items-start',
        )}
      >
        <article className="evento-ficha tarjeta-operacion overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <header className="evento-titular">
            <div className="evento-titular-texto">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 uppercase dark:bg-violet-950 dark:text-violet-200">
                  {obtenerEtiquetaCategoria(evento.category)}
                </p>
                <EstadoEventoEtiqueta estado={evento.status} />
              </div>

              <h1 className="evento-titulo">{evento.name}</h1>
            </div>
            <PanelCategoriaEvento
              categoria={evento.category}
              className="evento-portada-categoria"
            />
          </header>
          <div className="p-5 sm:p-7">
            {evento.description !== null && (
              <p className="mt-4 max-w-prose leading-relaxed text-slate-600 dark:text-slate-300">
                {evento.description}
              </p>
            )}

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3.5 dark:border-slate-700 dark:bg-slate-950">
                <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <IconoDato tipo="fecha" />
                  Fecha
                </dt>
                <dd className="mt-1 text-lg text-slate-950 dark:text-white">
                  <time dateTime={evento.eventDate}>
                    {formatearFechaEvento(evento.eventDate)}
                  </time>
                </dd>
              </div>

              <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3.5 dark:border-slate-700 dark:bg-slate-950">
                <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <IconoDato tipo="edad" />
                  Edad mínima
                </dt>
                <dd className="mt-1 text-lg text-slate-950 dark:text-white">
                  {evento.minimumAge === 0
                    ? 'Para todas las edades'
                    : `${evento.minimumAge} años`}
                </dd>
              </div>

              <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3.5 sm:col-span-2 dark:border-slate-700 dark:bg-slate-950">
                <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <IconoDato tipo="lugar" />
                  Sede
                </dt>
                <dd className="mt-1">
                  <Link
                    to={crearRuta.detalleSede(evento.venueCode)}
                    className="text-lg font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
                  >
                    {evento.venueName}
                  </Link>
                </dd>
              </div>
            </dl>

            <div className="mt-7 border-t border-violet-100 pt-5 dark:border-slate-700">
              <h2 className="font-titulo text-xl font-extrabold text-[#241044] dark:text-white">
                Artistas
              </h2>

              {evento.artists.length === 0 ? (
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  Aún no hay artistas asociados a este evento.
                </p>
              ) : (
                <ul className="mt-4 flex flex-wrap gap-3">
                  {evento.artists.map((artista) => (
                    <li key={artista.id}>
                      <Link
                        to={crearRuta.detalleArtista(artista.id)}
                        className="inline-flex rounded-full border border-violet-300 px-4 py-2 font-semibold text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-950"
                      >
                        {artista.stageName}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </article>

        {mostrarPanelCompra && (
          <section
            aria-labelledby="titulo-compra"
            className="evento-compra tarjeta-operacion rounded-3xl border border-violet-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900"
          >
            <h2
              id="titulo-compra"
              className="font-titulo text-xl font-extrabold text-[#241044] dark:text-white"
            >
              Compra tu entrada
            </h2>

            {!compraDisponible ? (
              <div
                role="status"
                className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
              >
                Las entradas no están disponibles para este evento.
              </div>
            ) : (
              <form
                noValidate
                onSubmit={(evento) =>
                  void handleSubmit(abrirConfirmacion)(evento)
                }
              >
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Selecciona el tipo de entrada. El precio final será calculado
                  de forma segura por PulsePass.
                </p>

                <fieldset className="mt-6">
                  <legend className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Tipo de entrada
                  </legend>

                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                    {opcionesTicket.map((opcion) => (
                      <label
                        key={opcion.tipo}
                        className="relative cursor-pointer"
                      >
                        <input
                          type="radio"
                          {...register('type')}
                          value={opcion.tipo}
                          className="peer sr-only"
                        />

                        <span className="evento-opcion block min-h-11 rounded-xl border border-slate-300 bg-white p-3 transition-colors peer-checked:border-violet-600 peer-checked:bg-violet-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet-600 dark:border-slate-700 dark:bg-slate-950 dark:peer-checked:border-violet-400 dark:peer-checked:bg-violet-950">
                          <strong className="block text-slate-950 dark:text-white">
                            {opcion.nombre}
                          </strong>
                          <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                            {opcion.descripcion}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {errors.type && (
                  <p
                    role="alert"
                    className="mt-2 text-sm text-red-700 dark:text-red-300"
                  >
                    Selecciona un tipo de entrada válido.
                  </p>
                )}

                {sesion.estado !== 'autenticado' && (
                  <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
                    Debes iniciar sesión para completar la compra.
                  </p>
                )}

                <div
                  data-barra-compra-movil
                  className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:static md:mt-6 md:border-0 md:bg-transparent md:p-0 dark:border-slate-700 dark:bg-slate-950 md:dark:bg-transparent"
                >
                  <Boton
                    type="submit"
                    className="w-full rounded-full! bg-violet-700! hover:bg-violet-800!"
                  >
                    {sesion.estado === 'autenticado'
                      ? 'Comprar entrada'
                      : 'Iniciar sesión para comprar'}
                  </Boton>
                </div>
              </form>
            )}
          </section>
        )}
      </div>

      <Modal
        abierto={puedeComprar && confirmacionAbierta}
        titulo="Confirmar compra"
        onCerrar={() => setConfirmacionAbierta(false)}
        bloquearCierre={compra.isPending}
      >
        <dl className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
          <div>
            <dt className="font-semibold">Evento</dt>
            <dd>{evento.name}</dd>
          </div>
          <div>
            <dt className="font-semibold">Tipo de entrada</dt>
            <dd>{obtenerEtiquetaTipoTicket(tipoSeleccionado)}</dd>
          </div>
          <div>
            <dt className="font-semibold">Cuenta</dt>
            <dd className="break-all">{email}</dd>
          </div>
        </dl>
        {errorCompra !== null && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
          >
            {errorCompra}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Boton
            type="button"
            variante="secundario"
            disabled={compra.isPending}
            onClick={() => setConfirmacionAbierta(false)}
          >
            Cancelar
          </Boton>
          <Boton
            type="button"
            cargando={compra.isPending}
            textoCargando="Procesando compra…"
            onClick={() => void comprarEntrada()}
          >
            Confirmar
          </Boton>
        </div>
      </Modal>
    </section>
  )
}
