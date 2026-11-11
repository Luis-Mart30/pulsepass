import { Link } from 'react-router'
import { crearRuta } from '../lib/rutas'
import { useSedesActivas } from '../funcionalidades/sedes/consultas'

export default function ListaSedes() {
  const consulta = useSedesActivas()

  if (consulta.isPending) {
    return (
      <section
        className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        aria-live="polite"
      >
        <p className="text-slate-600 dark:text-slate-300">
          Cargando sedes…
        </p>
      </section>
    )
  }

  if (consulta.isError) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
          Sedes
        </h1>
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          No fue posible cargar las sedes. Intenta nuevamente.
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
        Sedes
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
        Conoce los escenarios disponibles para nuestros eventos.
      </p>

      {consulta.data.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 p-6 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-300">
            No hay sedes activas disponibles en este momento.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {consulta.data.map((sede) => (
            <li
              key={sede.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="p-6">
                <p className="text-sm font-semibold text-violet-600">
                  {sede.city}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                  {sede.name}
                </h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {sede.address}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Capacidad:{' '}
                  {sede.capacity.toLocaleString('es-CO')} personas
                </p>

                <Link
                  to={crearRuta.detalleSede(sede.code)}
                  className="mt-6 inline-flex rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                >
                  Ver sede
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}