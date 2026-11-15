import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { registrarUsuarioApi } from '../funcionalidades/auth/api'
import {
  RegistroSchema,
  type RegistroDatos,
} from '../funcionalidades/auth/tipos'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

const CAMPOS_REGISTRO = new Set<keyof RegistroDatos>([
  'username',
  'email',
  'password',
  'firstName',
  'lastName',
  'birthDate',
])

function esCampoRegistro(
  campo: string,
): campo is keyof RegistroDatos {
  return CAMPOS_REGISTRO.has(campo as keyof RegistroDatos)
}

function obtenerFechaLocalActual(): string {
  const fecha = new Date()
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

function calcularFortaleza(password: string): {
  nivel: number
  texto: string
} {
  if (password.length === 0) {
    return { nivel: 0, texto: 'Sin evaluar' }
  }

  let puntuacion = 0

  if (password.length >= 12) puntuacion += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    puntuacion += 1
  }
  if (/\d/.test(password)) puntuacion += 1
  if (/[^A-Za-z0-9]/.test(password)) puntuacion += 1

  if (puntuacion <= 1) {
    return { nivel: 1, texto: 'baja' }
  }

  if (puntuacion <= 3) {
    return { nivel: 3, texto: 'media' }
  }

  return { nivel: 5, texto: 'alta' }
}

export default function Registro() {
  const navigate = useNavigate()
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(
    null,
  )

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistroDatos>({
    resolver: zodResolver(RegistroSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      birthDate: '',
    },
  })

  const password = useWatch({
    control,
    name: 'password',
  })
  const fortaleza = calcularFortaleza(password)

  const enviarRegistro = async (
    datos: RegistroDatos,
  ): Promise<void> => {
    setErrorGeneral(null)

    try {
      await registrarUsuarioApi(datos)

      navigate(RUTAS.LOGIN, {
        replace: true,
        state: { registrado: true },
      })
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          let detalleMapeado = false

          Object.entries(error.details).forEach(
            ([campo, mensaje]) => {
              if (esCampoRegistro(campo)) {
                setError(campo, {
                  type: 'server',
                  message: mensaje,
                })
                detalleMapeado = true
              }
            },
          )

          if (!detalleMapeado) {
            setErrorGeneral(
              'Revisa los datos ingresados e inténtalo nuevamente.',
            )
          }

          return
        }

        if (error.status === 409) {
          setErrorGeneral(
            'El usuario o correo ya está registrado.',
          )
          return
        }
      }

      setErrorGeneral(
        'No fue posible crear la cuenta. Inténtalo nuevamente.',
      )
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
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
            Crea tu cuenta
          </h1>
        </div>

        {errorGeneral !== null ? (
          <div
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
            role="alert"
          >
            {errorGeneral}
          </div>
        ) : null}

        <form
          className="space-y-5"
          noValidate
          onSubmit={handleSubmit(enviarRegistro)}
        >
          <Campo
            id="registro-username"
            etiqueta="Nombre de usuario"
            autoComplete="username"
            error={errors.username?.message}
            {...register('username')}
          />

          <Campo
            id="registro-email"
            etiqueta="Correo electrónico"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo
              id="registro-nombre"
              etiqueta="Nombres"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />

            <Campo
              id="registro-apellido"
              etiqueta="Apellidos"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Campo
            id="registro-fecha"
            etiqueta="Fecha de nacimiento"
            type="date"
            max={obtenerFechaLocalActual()}
            autoComplete="bday"
            error={errors.birthDate?.message}
            {...register('birthDate')}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="registro-password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Contraseña (mín. 12 caracteres)
            </label>

            <div className="relative">
              <input
                id="registro-password"
                type={mostrarPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-invalid={errors.password !== undefined}
                aria-describedby={
                  errors.password !== undefined
                    ? 'registro-password-error'
                    : 'registro-password-ayuda'
                }
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                id="registro-password-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.password.message}
              </p>
            ) : (
              <p
                id="registro-password-ayuda"
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                Entre 12 caracteres y 72 bytes.
              </p>
            )}

            <div
              className="grid grid-cols-5 gap-1 pt-1"
              aria-hidden="true"
            >
              {[1, 2, 3, 4, 5].map((segmento) => (
                <span
                  key={segmento}
                  className={
                    segmento <= fortaleza.nivel
                      ? 'h-1 rounded-full bg-indigo-600'
                      : 'h-1 rounded-full bg-slate-200 dark:bg-slate-700'
                  }
                />
              ))}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fortaleza: {fortaleza.texto}
            </p>
          </div>

          <Boton
            type="submit"
            cargando={isSubmitting}
            textoCargando="Creando cuenta…"
            className="w-full"
          >
            Crear cuenta
          </Boton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link
            className="font-semibold text-indigo-600 hover:text-indigo-700"
            to={RUTAS.LOGIN}
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  )
}