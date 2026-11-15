import { Link } from 'react-router'
import { AvatarArtista } from '../componentes/artistas/AvatarArtista'
import { Boton } from '../componentes/Boton'
import { TarjetaEvento } from '../componentes/eventos/TarjetaEvento'
import { useArtistasActivos } from '../funcionalidades/artistas/consultas'
import { useAuth } from '../funcionalidades/auth/useAuth'
import { useEventosPublicados } from '../funcionalidades/eventos/consultas'
import { RUTAS } from '../lib/rutas'

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
          className="h-52 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
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
  const eventosDestacados =
    consultaEventos.data?.slice(0, 3) ?? []
  const artistasDestacados =
    consultaArtistas.data?.slice(0, 6) ?? []

  return (
    <>
      <section className="bg-linear-to-r from-violet-700 to-fuchsia-600 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-100">
            Eventos y experiencias
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black sm:text-5xl lg:text-6xl">
            Descubre los mejores eventos
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-violet-50">
            Música, cultura, deporte y tecnología en un solo
            lugar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={RUTAS.EVENTOS}
              className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-3 font-semibold text-violet-800 transition hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Ver cartelera
            </Link>
            {sesion.estado === 'anonimo' ? (
              <Link
                to={RUTAS.REGISTRO}
                className="inline-flex min-h-11 items-center rounded-lg border border-white/70 px-5 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Crear cuenta
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
              Próximamente
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
              Próximos eventos
            </h2>
          </div>
          <Link
            to={RUTAS.EVENTOS}
            className="font-semibold text-violet-600 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          >
            Ver todos →
          </Link>
        </div>

        {consultaEventos.isPending ? (
          <Esqueletos cantidad={3} />
        ) : null}

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
          <p className="mt-8 text-slate-600 dark:text-slate-300">
            Aún no hay eventos publicados.
          </p>
        ) : null}

        {eventosDestacados.length > 0 ? (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventosDestacados.map((evento) => (
              <li key={evento.id}>
                <TarjetaEvento evento={evento} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
                Talento en escena
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                Artistas destacados
              </h2>
            </div>
            <Link
              to={RUTAS.ARTISTAS}
              className="font-semibold text-violet-600 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              Ver todos →
            </Link>
          </div>

          {consultaArtistas.isPending ? (
            <Esqueletos cantidad={3} />
          ) : null}

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
            <p className="mt-8 text-slate-600 dark:text-slate-300">
              Aún no hay artistas activos.
            </p>
          ) : null}

          {artistasDestacados.length > 0 ? (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
