import { TarjetaEvento } from '../componentes/eventos/TarjetaEvento'
import { useEventosPublicados } from '../funcionalidades/eventos/consultas'

export default function CatalogoEventos() {
  const consulta = useEventosPublicados()

  if (consulta.isPending) {
    return (
      <section
        className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        aria-live="polite"
      >
        <p className="text-slate-600 dark:text-slate-300">
          Cargando eventos…
        </p>
      </section>
    )
  }

  if (consulta.isError) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
          Eventos
        </h1>
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          No fue posible cargar los eventos. Intenta nuevamente.
        </div>
      </section>
    )
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

      {consulta.data.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 p-6 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-300">
            No hay eventos publicados en este momento.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {consulta.data.map((evento) => (
            <li key={evento.id}>
              <TarjetaEvento evento={evento} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}