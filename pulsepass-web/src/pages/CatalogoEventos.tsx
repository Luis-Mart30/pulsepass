import { useSearchParams } from 'react-router'
import { z } from 'zod'
import { Boton } from '../componentes/Boton'
import { TarjetaEvento } from '../componentes/eventos/TarjetaEvento'
import { useArtistasActivos } from '../funcionalidades/artistas/consultas'
import {
  useEventosPorArtista,
  useEventosPublicados,
} from '../funcionalidades/eventos/consultas'
import {
  CategoriaEventoSchema,
  type CategoriaEvento,
} from '../funcionalidades/eventos/tipos'
import { obtenerEtiquetaCategoria } from '../lib/formatos'

const ParametrosCatalogoSchema = z.object({
  q: z.string().trim().catch(''),
  categoria: CategoriaEventoSchema.optional().catch(undefined),
  artista: z.string().trim().catch(''),
})

const CATEGORIAS = CategoriaEventoSchema.options

export default function CatalogoEventos() {
  const [parametros, setParametros] = useSearchParams()
  const filtros = ParametrosCatalogoSchema.parse({
    q: parametros.get('q') ?? '',
    categoria: parametros.get('categoria') ?? undefined,
    artista: parametros.get('artista') ?? '',
  })

  const consultaPublicados = useEventosPublicados(
    filtros.artista.length === 0,
  )
  const consultaPorArtista = useEventosPorArtista(
    filtros.artista,
  )
  const consultaArtistas = useArtistasActivos()
  const consultaEventos =
    filtros.artista.length > 0
      ? consultaPorArtista
      : consultaPublicados

  const textoNormalizado = filtros.q.toLocaleLowerCase('es-CO')
  const eventosFiltrados = (consultaEventos.data ?? []).filter(
    (evento) =>
      (textoNormalizado.length === 0 ||
        evento.name
          .toLocaleLowerCase('es-CO')
          .includes(textoNormalizado)) &&
      (filtros.categoria === undefined ||
        evento.category === filtros.categoria),
  )
  const hayFiltros =
    filtros.q.length > 0 ||
    filtros.categoria !== undefined ||
    filtros.artista.length > 0

  const actualizarParametro = (
    nombre: 'q' | 'categoria' | 'artista',
    valor: string,
  ) => {
    setParametros((actuales) => {
      const siguientes = new URLSearchParams(actuales)

      if (valor.trim().length === 0) {
        siguientes.delete(nombre)
      } else {
        siguientes.set(nombre, valor)
      }

      return siguientes
    })
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
        PulsePass
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
        Catálogo de eventos
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
        Encuentra experiencias disponibles y consulta toda la
        información antes de obtener tu entrada.
      </p>

      <div
        className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-3 dark:border-slate-800 dark:bg-slate-900"
        aria-label="Filtros del catálogo"
      >
        <div>
          <label
            htmlFor="buscar-evento"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Buscar por nombre
          </label>
          <input
            id="buscar-evento"
            type="search"
            value={filtros.q}
            onChange={(evento) =>
              actualizarParametro('q', evento.target.value)
            }
            placeholder="Nombre del evento"
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="categoria-evento"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Categoría
          </label>
          <select
            id="categoria-evento"
            value={filtros.categoria ?? ''}
            onChange={(evento) =>
              actualizarParametro(
                'categoria',
                evento.target.value,
              )
            }
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((categoria: CategoriaEvento) => (
              <option key={categoria} value={categoria}>
                {obtenerEtiquetaCategoria(categoria)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="artista-evento"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Artista
          </label>
          <select
            id="artista-evento"
            value={filtros.artista}
            disabled={consultaArtistas.isPending}
            onChange={(evento) =>
              actualizarParametro('artista', evento.target.value)
            }
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="">Todos los artistas</option>
            {(consultaArtistas.data ?? []).map((artista) => (
              <option key={artista.id} value={artista.stageName}>
                {artista.stageName}
              </option>
            ))}
          </select>
        </div>

        {hayFiltros ? (
          <div className="md:col-span-3">
            <Boton
              type="button"
              variante="fantasma"
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
            className="mt-8 text-sm font-medium text-slate-600 dark:text-slate-300"
            aria-live="polite"
          >
            {eventosFiltrados.length}{' '}
            {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
          </p>

          {eventosFiltrados.length === 0 ? (
            <div className="mt-4 rounded-xl border border-slate-200 p-6 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-300">
                {hayFiltros
                  ? 'Sin resultados para tu búsqueda.'
                  : 'Aún no hay eventos publicados.'}
              </p>
            </div>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventosFiltrados.map((evento) => (
                <li key={evento.id}>
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
