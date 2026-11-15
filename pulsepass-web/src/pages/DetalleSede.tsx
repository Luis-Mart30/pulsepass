import { Link, useParams } from 'react-router'
import { RUTAS } from '../lib/rutas'
import { ApiError } from '../lib/http'
import { useSedePorCodigo } from '../funcionalidades/sedes/consultas'

export default function DetalleSede() {
  const { code = '' } = useParams<{ code: string }>()
  const consulta = useSedePorCodigo(code)

  if (consulta.isPending) {
    return (
      <section
        className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8"
        aria-live="polite"
      >
        <p className="text-slate-600 dark:text-slate-300">
          Cargando información de la sede…
        </p>
      </section>
    )
  }

  if (consulta.isError) {
    const noEncontrada =
      consulta.error instanceof ApiError && consulta.error.status === 404

    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
          {noEncontrada ? 'Sede no encontrada' : 'No pudimos cargar la sede'}
        </h1>
        <p role="alert" className="mt-4 text-slate-600 dark:text-slate-300">
          {noEncontrada
            ? 'La sede solicitada no existe o ya no está disponible.'
            : 'Ocurrió un problema al consultar la información. Intenta nuevamente.'}
        </p>
        <Link
          to={RUTAS.SEDES}
          className="mt-6 inline-flex font-semibold text-violet-600 hover:text-violet-700"
        >
          Volver a sedes
        </Link>
      </section>
    )
  }

  const sede = consulta.data

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to={RUTAS.SEDES}
        className="font-semibold text-violet-600 hover:text-violet-700"
      >
        ← Volver a sedes
      </Link>

      <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold tracking-wider text-violet-600 uppercase">
              {sede.city}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                sede.active
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {sede.active ? 'Activa' : 'No disponible'}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl dark:text-white">
            {sede.name}
          </h1>

          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Código
              </dt>
              <dd className="mt-1 text-lg text-slate-950 dark:text-white">
                {sede.code}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Capacidad
              </dt>
              <dd className="mt-1 text-lg text-slate-950 dark:text-white">
                {sede.capacity.toLocaleString('es-CO')} personas
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Dirección
              </dt>
              <dd className="mt-1 text-lg text-slate-950 dark:text-white">
                {sede.address}, {sede.city}
              </dd>
            </div>
          </dl>
        </div>
      </article>
    </section>
  )
}
