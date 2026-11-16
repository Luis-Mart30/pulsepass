import { Link, useParams } from 'react-router'
import { IlustracionSeccion } from '../componentes/IlustracionSeccion'
import { IconoSede } from '../componentes/sedes/IconoSede'
import { RUTAS } from '../lib/rutas'
import { ApiError } from '../lib/http'
import { useSedePorCodigo } from '../funcionalidades/sedes/consultas'
import './Sedes.css'

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
        <h1 className="font-titulo text-3xl font-extrabold text-slate-950 dark:text-white">
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
        className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-600 dark:text-violet-300 dark:hover:bg-slate-900"
      >
        ← Volver a sedes
      </Link>

      <article className="tarjeta-operacion mt-4 overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="sede-perfil">
          <div className="portada-ficha flex flex-wrap items-center gap-4 sm:gap-6">
            <IconoSede className="size-16 sm:size-20" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                  {sede.city}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    sede.active
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {sede.active ? 'Activa' : 'No disponible'}
                </span>
              </div>

              <h1 className="font-titulo mt-3 text-3xl font-extrabold tracking-tight break-words text-[#241044] sm:text-4xl dark:text-white">
                {sede.name}
              </h1>
            </div>
            <IlustracionSeccion tipo="sedes" />
          </div>

          <dl className="sede-perfil-datos grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 rounded-xl border border-violet-100 bg-violet-50/60 p-4 dark:border-slate-700 dark:bg-slate-950">
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Código
              </dt>
              <dd className="mt-1 font-mono font-semibold break-all text-slate-950 dark:text-white">
                {sede.code}
              </dd>
            </div>

            <div className="min-w-0 rounded-xl border border-violet-100 bg-violet-50/60 p-4 dark:border-slate-700 dark:bg-slate-950">
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Capacidad
              </dt>
              <dd className="mt-1 font-semibold break-words text-slate-950 dark:text-white">
                {sede.capacity.toLocaleString('es-CO')} personas
              </dd>
            </div>

            <div className="min-w-0 rounded-xl border border-violet-100 bg-violet-50/60 p-4 sm:col-span-2 dark:border-slate-700 dark:bg-slate-950">
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Dirección
              </dt>
              <dd className="mt-1 font-semibold break-words text-slate-950 dark:text-white">
                {sede.address}, {sede.city}
              </dd>
            </div>
          </dl>
        </div>
      </article>
    </section>
  )
}
