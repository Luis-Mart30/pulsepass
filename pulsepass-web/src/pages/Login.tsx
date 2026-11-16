import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { IlustracionSeccion } from '../componentes/IlustracionSeccion'
import { useAuth } from '../funcionalidades/auth/useAuth'
import { LoginSchema, type LoginDatos } from '../funcionalidades/auth/tipos'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import './Acceso.css'
import { IconoNota } from '../componentes/IconoNota'

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

  if (typeof desde === 'object' && typeof desde.pathname === 'string') {
    return `${desde.pathname}${desde.search ?? ''}${desde.hash ?? ''}`
  }

  return RUTAS.INICIO
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { iniciarSesion } = useAuth()
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

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

  const enviarLogin = async (datos: LoginDatos): Promise<void> => {
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

          if (identifierError !== undefined || passwordError !== undefined) {
            return
          }
        }
      }

      setErrorGeneral('No fue posible iniciar sesión. Inténtalo más tarde.')
    }
  }

  return (
    <section className="acceso-pagina relative mx-auto flex w-full max-w-6xl justify-center px-4 py-8 sm:px-6 sm:py-12">
      <IlustracionSeccion tipo="acceso" />
      <div className="acceso-tarjeta w-full min-w-0 rounded-3xl border border-violet-200 bg-white p-5 sm:p-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="acceso-cabecera mb-6 text-center">
          <div
            className="marca-pulsepass-icono mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-violet-700 text-white shadow-sm"
            aria-hidden="true"
          >
            <IconoNota />
          </div>

          <h1 className="font-titulo text-2xl font-extrabold tracking-tight text-[#241044] sm:text-3xl dark:text-white">
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
          className="space-y-4 sm:space-y-5"
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
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-12 text-slate-900 transition outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('password')}
              />

              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-violet-700 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-600 dark:text-violet-200 dark:hover:bg-slate-800"
                aria-label={
                  mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                onClick={() => setMostrarPassword((actual) => !actual)}
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
            className="w-full rounded-full! bg-violet-700! hover:bg-violet-800!"
          >
            Ingresar
          </Boton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link
            className="font-semibold text-violet-700 underline-offset-4 hover:underline dark:text-violet-300"
            to={RUTAS.REGISTRO}
          >
            Regístrate
          </Link>
        </p>
      </div>
    </section>
  )
}
