import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'
import arteCartelera from '../assets/pulsepass-cartelera-3d.webp'
import { Boton } from '../componentes/Boton'
import { TarjetaEvento } from '../componentes/eventos/TarjetaEvento'
import {
  useArtistaPorNombre,
  useArtistasActivos,
} from '../funcionalidades/artistas/consultas'
import {
  useEventosPorArtista,
  useEventosPublicados,
} from '../funcionalidades/eventos/consultas'
import {
  CategoriaEventoSchema,
  type CategoriaEvento,
} from '../funcionalidades/eventos/tipos'
import { obtenerEtiquetaCategoria } from '../lib/formatos'
import { crearRuta } from '../lib/rutas'
import '../componentes/ExperienciaPulsePass.css'
import './CatalogoEventos.css'

const ParametrosCatalogoSchema = z.object({
  q: z.string().catch(''),
  categoria: CategoriaEventoSchema.optional().catch(undefined),
  artista: z.string().trim().catch(''),
})

const CATEGORIAS = CategoriaEventoSchema.options

const CLASE_FILTRO =
  'min-w-0 rounded-xl border border-violet-200 bg-violet-50/60 p-3.5 focus-within:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-violet-400'

const CLASE_ETIQUETA =
  'mb-2 block text-sm font-semibold text-[#392451] dark:text-slate-100'

const CLASE_CONTROL = [
  'min-h-11 w-full min-w-0 rounded-xl border border-violet-200',
  'bg-white px-3 py-2 text-slate-900 scheme-light',
  'placeholder:text-slate-500 disabled:opacity-60',
  'focus:border-violet-600 focus:outline-2 focus:outline-offset-2 focus:outline-violet-600',
  'dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:scheme-dark',
  'dark:focus:border-violet-300 dark:focus:outline-violet-300',
].join(' ')

export default function CatalogoEventos() {
  const [parametros, setParametros] = useSearchParams()
  const filtros = ParametrosCatalogoSchema.parse({
    q: parametros.get('q') ?? '',
    categoria: parametros.get('categoria') ?? undefined,
    artista: parametros.get('artista') ?? '',
  })

  const consultaPublicados = useEventosPublicados(filtros.artista.length === 0)
  const consultaPorArtista = useEventosPorArtista(filtros.artista)
  const consultaArtistas = useArtistasActivos()
  const { data: artistaSeleccionado } = useArtistaPorNombre(filtros.artista)
  const consultaEventos =
    filtros.artista.length > 0 ? consultaPorArtista : consultaPublicados

  const textoNormalizado = filtros.q.trim().toLocaleLowerCase('es-CO')
  const eventosFiltrados = (consultaEventos.data ?? []).filter(
    (evento) =>
      (textoNormalizado.length === 0 ||
        evento.name.toLocaleLowerCase('es-CO').includes(textoNormalizado)) &&
      (filtros.categoria === undefined ||
        evento.category === filtros.categoria),
  )
  const hayFiltros =
    textoNormalizado.length > 0 ||
    filtros.categoria !== undefined ||
    filtros.artista.length > 0

  const actualizarParametro = (
    nombre: 'q' | 'categoria' | 'artista',
    valor: string,
  ) => {
    setParametros((actuales) => {
      const siguientes = new URLSearchParams(actuales)

      const valorParametro = nombre === 'q' ? valor : valor.trim()

      if (valorParametro.length === 0) {
        siguientes.delete(nombre)
      } else {
        siguientes.set(nombre, valorParametro)
      }

      return siguientes
    })
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
      <header className="portada-seccion catalogo-portada">
        <div className="min-w-0">
          <h1 className="font-titulo text-3xl leading-tight font-extrabold tracking-tight text-[#241044] sm:text-4xl lg:text-5xl dark:text-slate-100">
            Catálogo de{' '}
            <span className="text-violet-700 dark:text-fuchsia-300">
              eventos
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Encuentra experiencias disponibles y consulta toda la información
            antes de obtener tu entrada.
          </p>
        </div>
        <img
          className="catalogo-arte movimiento-ilustracion"
          src={arteCartelera}
          alt=""
          width={704}
          height={704}
        />
      </header>

      <div
        className="catalogo-filtros grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]"
        aria-label="Filtros del catálogo"
      >
        <div className={CLASE_FILTRO}>
          <label htmlFor="buscar-evento" className={CLASE_ETIQUETA}>
            Buscar por nombre
          </label>
          <div className="catalogo-busqueda">
            <input
              id="buscar-evento"
              type="search"
              value={filtros.q}
              onChange={(evento) =>
                actualizarParametro('q', evento.target.value)
              }
              placeholder="Nombre del evento"
              className={CLASE_CONTROL}
            />
          </div>
        </div>

        <div className={CLASE_FILTRO}>
          <label htmlFor="categoria-evento" className={CLASE_ETIQUETA}>
            Categoría
          </label>
          <select
            id="categoria-evento"
            value={filtros.categoria ?? ''}
            onChange={(evento) =>
              actualizarParametro('categoria', evento.target.value)
            }
            className={`selector-pulsepass ${CLASE_CONTROL}`}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((categoria: CategoriaEvento) => (
              <option key={categoria} value={categoria}>
                {obtenerEtiquetaCategoria(categoria)}
              </option>
            ))}
          </select>
        </div>

        <div className={CLASE_FILTRO}>
          <label htmlFor="artista-evento" className={CLASE_ETIQUETA}>
            Artista
          </label>
          <select
            id="artista-evento"
            value={filtros.artista}
            disabled={consultaArtistas.isPending}
            onChange={(evento) =>
              actualizarParametro('artista', evento.target.value)
            }
            className={`selector-pulsepass ${CLASE_CONTROL}`}
          >
            <option value="">Todos los artistas</option>
            {(consultaArtistas.data ?? []).map((artista) => (
              <option key={artista.id} value={artista.stageName}>
                {artista.stageName}
              </option>
            ))}
          </select>
          {artistaSeleccionado ? (
            <Link
              className="mt-2 inline-block text-sm text-violet-700 underline dark:text-violet-300"
              to={crearRuta.detalleArtista(artistaSeleccionado.id)}
            >
              Ver perfil de {artistaSeleccionado.stageName}
            </Link>
          ) : null}
        </div>

        {hayFiltros ? (
          <div className="md:col-span-3 md:justify-self-end">
            <Boton
              type="button"
              variante="fantasma"
              className="rounded-full border border-violet-200 bg-white px-4 text-violet-800 dark:border-slate-600 dark:bg-slate-950 dark:text-violet-200"
              onClick={() => setParametros({})}
            >
              Limpiar filtros
            </Boton>
          </div>
        ) : null}
      </div>

      {consultaEventos.isPending ? (
        <p
          className="mt-8 text-slate-600 dark:text-slate-300"
          aria-live="polite"
        >
          Cargando eventos…
        </p>
      ) : null}

      {consultaEventos.isError ? (
        <div
          role="alert"
          className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <p>No fue posible cargar los eventos.</p>
          <Boton
            type="button"
            variante="secundario"
            className="mt-4"
            onClick={() => void consultaEventos.refetch()}
          >
            Reintentar
          </Boton>
        </div>
      ) : null}

      {!consultaEventos.isPending && !consultaEventos.isError ? (
        <>
          <p
            className="catalogo-resultados mt-7 w-fit rounded-full px-3 py-1 text-sm font-semibold"
            aria-live="polite"
          >
            {eventosFiltrados.length}{' '}
            {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
          </p>

          {eventosFiltrados.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-6 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-slate-600 dark:text-slate-300">
                {hayFiltros
                  ? 'Sin resultados para tu búsqueda.'
                  : 'Aún no hay eventos publicados.'}
              </p>
            </div>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventosFiltrados.map((evento) => (
                <li key={evento.id} className="min-w-0">
                  <TarjetaEvento evento={evento} />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </section>
  )
}
