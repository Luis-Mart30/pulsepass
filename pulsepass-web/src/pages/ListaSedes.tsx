import { Link } from 'react-router'
import { IconoSede } from '../componentes/sedes/IconoSede'
import { crearRuta } from '../lib/rutas'
import { useSedesActivas } from '../funcionalidades/sedes/consultas'
import './Sedes.css'

export default function ListaSedes() {
  const consulta = useSedesActivas()

  if (consulta.isPending) {
    return (
      <section
        className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        aria-live="polite"
      >
        <p className="text-slate-600 dark:text-slate-300">Cargando sedes…</p>
      </section>
    )
  }

  if (consulta.isError) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-titulo text-3xl font-extrabold text-slate-950 dark:text-white">
          Sedes
        </h1>
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          No fue posible cargar las sedes. Intenta nuevamente.
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="portada-seccion portada-sedes">
        <div>
          <h1 className="font-titulo text-3xl font-extrabold tracking-tight text-[#241044] sm:text-4xl lg:text-5xl dark:text-slate-100">
            Sedes
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Conoce los escenarios disponibles para nuestros eventos.
          </p>
        </div>
        <div className="sede-arte" aria-hidden="true">
          <IconoSede className="sede-arte-pin" />
        </div>
      </header>

      {consulta.data.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50/60 p-6 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-300">
            No hay sedes activas disponibles en este momento.
          </p>
        </div>
      ) : (
        <ul className="sedes-lista mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {consulta.data.map((sede) => (
            <li key={sede.id} className="min-w-0">
              <Link
                to={crearRuta.detalleSede(sede.code)}
                aria-label={`Ver sede ${sede.name}`}
                className="sede-tarjeta"
              >
                <div className="sede-mapa" aria-hidden="true">
                  <IconoSede className="sede-pin size-14" />
                </div>
                <div className="flex min-w-0 flex-col items-start p-5 sm:p-6">
                  <div className="flex flex-wrap gap-2">
                    <p className="sede-ciudad rounded-full px-2.5 py-1 text-xs font-semibold">
                      {sede.city}
                    </p>
                    {sede.active ? (
                      <p className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        Activa
                      </p>
                    ) : null}
                  </div>
                  <h2 className="font-titulo mt-3 text-xl font-extrabold break-words text-[#241044] dark:text-white">
                    {sede.name}
                  </h2>
                  <p className="mt-3 text-sm break-words text-slate-600 dark:text-slate-300">
                    {sede.address}
                  </p>
                  <p className="mt-2 mb-4 text-sm text-slate-600 dark:text-slate-300">
                    Capacidad: {sede.capacity.toLocaleString('es-CO')} personas
                  </p>

                  <span className="sede-accion mt-auto inline-flex w-full items-center justify-between gap-3 border-t border-violet-100 pt-3 text-sm font-semibold text-violet-800 dark:border-slate-700 dark:text-violet-200">
                    Ver sede <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
