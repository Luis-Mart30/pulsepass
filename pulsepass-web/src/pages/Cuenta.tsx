import { Link } from 'react-router'
import { Boton } from '../componentes/Boton'
import { useAuth } from '../funcionalidades/auth/useAuth'
import {
  useUsuarioPorEmail,
  useUsuarioPorUsername,
} from '../funcionalidades/usuarios/consultas'
import { RUTAS } from '../lib/rutas'

function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-')

  if (
    anio === undefined ||
    mes === undefined ||
    dia === undefined
  ) {
    return fecha
  }

  return `${dia}/${mes}/${anio}`
}

export default function Cuenta() {
  const { sesion, cerrarSesion } = useAuth()

  const email =
    sesion.estado === 'autenticado'
      ? sesion.usuario.email
      : ''
  const username =
    sesion.estado === 'autenticado'
      ? sesion.usuario.username
      : ''

  const consultaEmail = useUsuarioPorEmail(email)
  const consultaUsername = useUsuarioPorUsername(username)
  const usuario =
    consultaEmail.data ?? consultaUsername.data
  const consultaPendiente =
    usuario === undefined &&
    (consultaEmail.isPending || consultaUsername.isPending)
  const consultaConError =
    usuario === undefined &&
    consultaEmail.isError &&
    consultaUsername.isError

  if (sesion.estado !== 'autenticado') {
    return (
      <p className="py-12 text-center text-slate-600 dark:text-slate-300">
        Cargando sesión…
      </p>
    )
  }

  if (consultaPendiente) {
    return (
      <section
        className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
        aria-busy="true"
      >
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
          Mi cuenta
        </h1>
        <p className="mt-6 text-slate-600 dark:text-slate-300">
          Cargando información de la cuenta…
        </p>
      </section>
    )
  }

  if (consultaConError) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
          Mi cuenta
        </h1>

        <div
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          role="alert"
        >
          <p>No fue posible cargar la información de la cuenta.</p>
          <Boton
            type="button"
            variante="secundario"
            className="mt-4"
            onClick={() => {
              void consultaEmail.refetch()
              void consultaUsername.refetch()
            }}
          >
            Reintentar
          </Boton>
        </div>
      </section>
    )
  }

  if (usuario === undefined) {
    return null
  }

  const iniciales =
    `${usuario.firstName.charAt(0)}${usuario.lastName.charAt(0)}`.toUpperCase()

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
        Mi cuenta
      </h1>

      <article className="mt-7 flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
            aria-hidden="true"
          >
            {iniciales}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              {usuario.firstName} {usuario.lastName}
            </h2>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              @{usuario.username} · {usuario.email}
            </p>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Nacimiento: {formatearFecha(usuario.birthDate)}
            </p>

            {usuario.city !== null ? (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Ciudad: {usuario.city}
              </p>
            ) : null}
          </div>
        </div>

        <dl className="flex gap-6 text-sm sm:text-right">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">
              Rol
            </dt>
            <dd className="mt-1 font-semibold text-indigo-700 dark:text-indigo-300">
              {sesion.usuario.roles.join(', ')}
            </dd>
          </div>

          <div>
            <dt className="text-slate-500 dark:text-slate-400">
              Estado
            </dt>
            <dd className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">
              {usuario.active ? 'Activa' : 'Inactiva'}
            </dd>
          </div>
        </dl>
      </article>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        {sesion.usuario.roles.includes('USER') ? (
          <Link
            to={RUTAS.MIS_TICKETS}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            Ver mis tickets
          </Link>
        ) : (
          <span />
        )}

        <Boton
          type="button"
          variante="secundario"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </Boton>
      </div>
    </section>
  )
}
