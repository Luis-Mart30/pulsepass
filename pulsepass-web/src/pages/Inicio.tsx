import { Link } from 'react-router'
import { AvatarArtista } from '../componentes/artistas/AvatarArtista'
import { Boton } from '../componentes/Boton'
import { TarjetaEvento } from '../componentes/eventos/TarjetaEvento'
import { useArtistasActivos } from '../funcionalidades/artistas/consultas'
import { useAuth } from '../funcionalidades/auth/useAuth'
import { useEventosPublicados } from '../funcionalidades/eventos/consultas'
import { RUTAS } from '../lib/rutas'
import './Inicio.css'

function Esqueletos({ cantidad }: { cantidad: number }) {
  return (
    <div
      role="status"
      aria-label="Cargando contenido"
      className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: cantidad }, (_, indice) => (
        <div
          key={indice}
          className="h-52 rounded-2xl bg-violet-100 motion-safe:animate-pulse dark:bg-slate-800"
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export default function Inicio() {
  const { sesion } = useAuth()
  const consultaEventos = useEventosPublicados()
  const consultaArtistas = useArtistasActivos()
  const eventosDestacados = consultaEventos.data?.slice(0, 3) ?? []
  const artistasDestacados = consultaArtistas.data?.slice(0, 6) ?? []

  return (
    <>
      <section
        aria-labelledby="inicio-titulo"
        className="px-4 py-9 sm:px-6 sm:py-10 lg:px-8 lg:py-11"
      >
        <div className="inicio-portada mx-auto w-full max-w-7xl">
          <div
            aria-hidden="true"
            className="inicio-ilustracion inicio-boletos"
          />

          <div className="inicio-contenido min-w-0 text-center">
            <h1
              id="inicio-titulo"
              className="inicio-titulo text-[#241044] dark:text-slate-100"
            >
              Descubre los mejores{' '}
              <span className="inicio-titulo-destacado">eventos</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-[#51415f] sm:text-lg dark:text-slate-400">
              Música, cultura, deporte y tecnología en un solo lugar.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3 sm:mt-6">
              <Link
                to={RUTAS.EVENTOS}
                className="inicio-accion inicio-accion-principal inline-flex min-h-11 items-center justify-center gap-3 rounded-full bg-violet-700 px-7 py-2.5 font-bold text-white transition-colors hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700"
              >
                Ver cartelera
              </Link>
              {sesion.estado === 'anonimo' ? (
                <Link
                  to={RUTAS.REGISTRO}
                  className="inicio-accion inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#241044] px-7 py-2.5 font-bold text-[#241044] transition-colors hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:outline-violet-300"
                >
                  Crear cuenta
                </Link>
              ) : null}
            </div>
          </div>

          <div
            aria-hidden="true"
            className="inicio-ilustracion inicio-audifonos"
          />
        </div>
      </section>

      <section
        aria-labelledby="inicio-eventos"
        className="mx-auto w-full max-w-7xl px-4 pt-3 pb-10 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            id="inicio-eventos"
            className="rounded-sm border-l-4 border-violet-700 pl-3 text-2xl font-extrabold tracking-tight text-[#241044] sm:text-3xl dark:border-violet-400 dark:text-slate-100"
          >
            Próximos eventos
          </h2>
          <Link
            to={RUTAS.EVENTOS}
            className="font-semibold text-violet-600 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:text-violet-300 dark:hover:text-violet-200 dark:focus-visible:outline-violet-300"
          >
            Ver todos →
          </Link>
        </div>

        {consultaEventos.isPending ? <Esqueletos cantidad={3} /> : null}

        {consultaEventos.isError ? (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            <p>No fue posible cargar los eventos destacados.</p>
            <Boton
              type="button"
              variante="secundario"
              className="mt-4"
              onClick={() => void consultaEventos.refetch()}
            >
              Reintentar eventos
            </Boton>
          </div>
        ) : null}

        {!consultaEventos.isPending &&
        !consultaEventos.isError &&
        eventosDestacados.length === 0 ? (
          <p className="mt-8 text-[#51415f] dark:text-slate-400">
            Aún no hay eventos publicados.
          </p>
        ) : null}

        {eventosDestacados.length > 0 ? (
          <ul className="inicio-lista mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventosDestacados.map((evento) => (
              <li key={evento.id} className="min-w-0">
                <TarjetaEvento evento={evento} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section
        aria-labelledby="inicio-artistas"
        className="border-t border-violet-100 px-4 py-10 sm:px-6 lg:px-8 dark:border-slate-800"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              id="inicio-artistas"
              className="rounded-sm border-l-4 border-violet-700 pl-3 text-2xl font-extrabold tracking-tight text-[#241044] sm:text-3xl dark:border-violet-400 dark:text-slate-100"
            >
              Artistas destacados
            </h2>
            <Link
              to={RUTAS.ARTISTAS}
              className="font-semibold text-violet-600 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:text-violet-300 dark:hover:text-violet-200 dark:focus-visible:outline-violet-300"
            >
              Ver todos →
            </Link>
          </div>

          {consultaArtistas.isPending ? <Esqueletos cantidad={3} /> : null}

          {consultaArtistas.isError ? (
            <div
              role="alert"
              className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
            >
              <p>No fue posible cargar los artistas destacados.</p>
              <Boton
                type="button"
                variante="secundario"
                className="mt-4"
                onClick={() => void consultaArtistas.refetch()}
              >
                Reintentar artistas
              </Boton>
            </div>
          ) : null}

          {!consultaArtistas.isPending &&
          !consultaArtistas.isError &&
          artistasDestacados.length === 0 ? (
            <p className="mt-8 text-[#51415f] dark:text-slate-400">
              Aún no hay artistas activos.
            </p>
          ) : null}

          {artistasDestacados.length > 0 ? (
            <ul className="inicio-lista mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artistasDestacados.map((artista) => (
                <li key={artista.id}>
                  <AvatarArtista artista={artista} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </>
  )
}
