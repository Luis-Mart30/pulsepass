import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { useAuth } from '../funcionalidades/auth/useAuth'
import {
  LoginSchema,
  type LoginDatos,
} from '../funcionalidades/auth/tipos'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

interface EstadoLogin {
  registrado?: boolean
  motivo?: string
  desde?:
    | string
    | {
        pathname?: string
        search?: string
        hash?: string
      }
}

function obtenerDestino(estado: EstadoLogin | null): string {
  const desde = estado?.desde

  if (typeof desde === 'string' && desde.startsWith('/')) {
    return desde
  }

  if (
    typeof desde === 'object' &&
    typeof desde.pathname === 'string'
  ) {
    return `${desde.pathname}${desde.search ?? ''}${desde.hash ?? ''}`
  }

  return RUTAS.INICIO
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { iniciarSesion } = useAuth()
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(
    null,
  )

  const estado = location.state as EstadoLogin | null

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginDatos>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const enviarLogin = async (
    datos: LoginDatos,
  ): Promise<void> => {
    setErrorGeneral(null)

    try {
      await iniciarSesion(datos)

      navigate(obtenerDestino(estado), {
        replace: true,
      })
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setErrorGeneral('Credenciales inválidas.')
          return
        }

        if (error.status === 400) {
          const identifierError = error.details.identifier
          const passwordError = error.details.password

          if (identifierError !== undefined) {
            setError('identifier', {
              type: 'server',
              message: identifierError,
            })
          }

          if (passwordError !== undefined) {
            setError('password', {
              type: 'server',
              message: passwordError,
            })
          }

          if (
            identifierError !== undefined ||
            passwordError !== undefined
          ) {
            return
          }
        }
      }

      setErrorGeneral(
        'No fue posible iniciar sesión. Inténtalo más tarde.',
      )
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-7 text-center">
          <div
            className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-indigo-600 text-white"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18V5l10-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="16" cy="16" r="3" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            Inicia sesión
          </h1>
        </div>

        {estado?.registrado === true ? (
          <div
            className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
            role="status"
          >
            Cuenta creada, inicia sesión.
          </div>
        ) : null}

        {estado?.motivo === 'expirada' ? (
          <div
            className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
            role="status"
          >
            Tu sesión expiró. Inicia sesión nuevamente.
          </div>
        ) : null}

        {errorGeneral !== null ? (
          <div
            className="mb-5 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
            role="alert"
          >
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 size-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.3 3.7 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
            </svg>
            <span>{errorGeneral}</span>
          </div>
        ) : null}

        <form
          className="space-y-5"
          noValidate
          onSubmit={handleSubmit(enviarLogin)}
        >
          <Campo
            id="login-identifier"
            etiqueta="Usuario o correo"
            autoComplete="username"
            error={errors.identifier?.message}
            {...register('identifier')}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Contraseña
            </label>

            <div className="relative">
              <input
                id="login-password"
                type={mostrarPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={errors.password !== undefined}
                aria-describedby={
                  errors.password !== undefined
                    ? 'login-password-error'
                    : undefined
                }
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-12 text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('password')}
              />

              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-indigo-600"
                aria-label={
                  mostrarPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
                onClick={() =>
                  setMostrarPassword((actual) => !actual)
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            {errors.password !== undefined ? (
              <p
                id="login-password-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <Boton
            type="submit"
            cargando={isSubmitting}
            textoCargando="Ingresando…"
            className="w-full"
          >
            Ingresar
          </Boton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link
            className="font-semibold text-indigo-600 hover:text-indigo-700"
            to={RUTAS.REGISTRO}
          >
            Regístrate
          </Link>
        </p>
      </div>
    </section>
  )
}