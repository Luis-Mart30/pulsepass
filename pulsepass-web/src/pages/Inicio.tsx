import { Link } from 'react-router'
import { TarjetaEvento } from '../componentes/eventos/TarjetaEvento'
import { useEventosPublicados } from '../funcionalidades/eventos/consultas'
import { RUTAS } from '../lib/rutas'

export default function Inicio() {
  const consulta = useEventosPublicados()
  const eventosDestacados = consulta.data?.slice(0, 3) ?? []

  return (
    <>
      <section className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
            Eventos y experiencias
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold sm:text-5xl">
            Encuentra tu próximo evento con PulsePass
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Explora eventos, conoce sus artistas y sedes, y
            administra tus entradas desde un solo lugar.
          </p>
          <Link
            to={RUTAS.EVENTOS}
            className="mt-8 inline-flex rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500"
          >
            Explorar eventos
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
              Próximamente
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
              Eventos destacados
            </h2>
          </div>
          <Link
            to={RUTAS.EVENTOS}
            className="font-semibold text-violet-600 hover:text-violet-700"
          >
            Ver todos
          </Link>
        </div>

        {consulta.isPending && (
          <p
            className="mt-8 text-slate-600 dark:text-slate-300"
            aria-live="polite"
          >
            Cargando eventos destacados…
          </p>
        )}

        {consulta.isError && (
          <p
            role="alert"
            className="mt-8 text-red-700"
          >
            No fue posible cargar los eventos destacados.
          </p>
        )}

        {!consulta.isPending &&
          !consulta.isError &&
          eventosDestacados.length === 0 && (
            <p className="mt-8 text-slate-600 dark:text-slate-300">
              No hay eventos publicados en este momento.
            </p>
          )}

        {eventosDestacados.length > 0 && (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventosDestacados.map((evento) => (
              <li key={evento.id}>
                <TarjetaEvento evento={evento} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}