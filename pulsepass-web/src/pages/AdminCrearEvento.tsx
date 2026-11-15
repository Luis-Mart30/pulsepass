import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { useCrearEvento } from '../funcionalidades/eventos/consultas'
import {
  CrearEventoSchema,
  type CrearEventoDatos,
} from '../funcionalidades/eventos/tipos'
import { useSedesActivas } from '../funcionalidades/sedes/consultas'
import { ApiError } from '../lib/http'
import { crearRuta, RUTAS } from '../lib/rutas'

const FormularioEventoSchema = CrearEventoSchema.extend({
  description: z
    .string()
    .max(1000, 'La descripción no puede superar 1000 caracteres'),
})

type FormularioEventoDatos = z.infer<
  typeof FormularioEventoSchema
>

const CATEGORIAS = [
  { valor: 'MUSIC', etiqueta: 'Música' },
  { valor: 'SPORTS', etiqueta: 'Deportes' },
  { valor: 'TECHNOLOGY', etiqueta: 'Tecnología' },
  { valor: 'EDUCATION', etiqueta: 'Educación' },
  { valor: 'CULTURE', etiqueta: 'Cultura' },
  { valor: 'ENTERTAINMENT', etiqueta: 'Entretenimiento' },
] as const

const CAMPOS_EVENTO = new Set<keyof FormularioEventoDatos>([
  'eventCode',
  'name',
  'description',
  'category',
  'eventDate',
  'minimumAge',
  'venueCode',
])

function esCampoEvento(
  campo: string,
): campo is keyof FormularioEventoDatos {
  return CAMPOS_EVENTO.has(
    campo as keyof FormularioEventoDatos,
  )
}

export default function AdminCrearEvento() {
  const navigate = useNavigate()
  const crearEvento = useCrearEvento()
  const sedes = useSedesActivas()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(
    null,
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormularioEventoDatos>({
    resolver: zodResolver(FormularioEventoSchema),
    defaultValues: {
      eventCode: '',
      name: '',
      description: '',
      category: 'MUSIC',
      eventDate: '',
      minimumAge: 0,
      venueCode: '',
    },
  })

  const enviar = async (
    formulario: FormularioEventoDatos,
  ): Promise<void> => {
    setErrorGeneral(null)

    const datos: CrearEventoDatos = {
      ...formulario,
      description:
        formulario.description.trim().length === 0
          ? null
          : formulario.description.trim(),
    }

    try {
      const evento = await crearEvento.mutateAsync(datos)

      navigate(crearRuta.gestionEvento(evento.eventCode), {
        replace: true,
        state: { creado: true },
      })
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          let detalleMapeado = false

          Object.entries(error.details).forEach(
            ([campo, mensaje]) => {
              if (esCampoEvento(campo)) {
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
            'Ya existe un evento registrado con ese código.',
          )
          return
        }
      }

      setErrorGeneral(
        'No fue posible crear el evento. Inténtalo nuevamente.',
      )
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <Link
          to={RUTAS.ADMIN_EVENTOS}
          className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Volver a eventos
        </Link>
        <p className="mt-6 font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
          Panel administrativo
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
          Crear evento
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          El evento se guardará inicialmente como borrador.
        </p>
      </header>

      <form
        noValidate
        onSubmit={handleSubmit(enviar)}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900"
      >
        {errorGeneral !== null ? (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            {errorGeneral}
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            id="eventCode"
            etiqueta="Código del evento"
            placeholder="Ej. FEST-2027"
            autoComplete="off"
            error={errors.eventCode?.message}
            {...register('eventCode')}
          />

          <Campo
            id="name"
            etiqueta="Nombre del evento"
            placeholder="Ej. Festival del Caribe"
            error={errors.name?.message}
            {...register('name')}
          />

          <label className="space-y-1.5 sm:col-span-2">
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Descripción
            </span>
            <textarea
              id="description"
              rows={5}
              aria-invalid={errors.description !== undefined}
              aria-describedby={
                errors.description !== undefined
                  ? 'description-error'
                  : undefined
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Describe la experiencia del evento"
              {...register('description')}
            />
            {errors.description !== undefined ? (
              <p
                id="description-error"
                role="alert"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {errors.description.message}
              </p>
            ) : null}
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Categoría
            </span>
            <select
              id="category"
              aria-invalid={errors.category !== undefined}
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              {...register('category')}
            >
              {CATEGORIAS.map((categoria) => (
                <option
                  key={categoria.valor}
                  value={categoria.valor}
                >
                  {categoria.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <Campo
            id="eventDate"
            etiqueta="Fecha y hora"
            type="datetime-local"
            step="1"
            error={errors.eventDate?.message}
            {...register('eventDate')}
          />

          <Campo
            id="minimumAge"
            etiqueta="Edad mínima"
            type="number"
            min="0"
            error={errors.minimumAge?.message}
            {...register('minimumAge', {
              valueAsNumber: true,
            })}
          />

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Sede
            </span>
            <select
              id="venueCode"
              disabled={sedes.isPending || sedes.isError}
              aria-invalid={errors.venueCode !== undefined}
              aria-describedby={
                errors.venueCode !== undefined
                  ? 'venueCode-error'
                  : undefined
              }
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              {...register('venueCode')}
            >
              <option value="">
                {sedes.isPending
                  ? 'Cargando sedes...'
                  : 'Selecciona una sede'}
              </option>
              {sedes.data?.map((sede) => (
                <option key={sede.code} value={sede.code}>
                  {sede.name} — {sede.city}
                </option>
              ))}
            </select>

            {errors.venueCode !== undefined ? (
              <p
                id="venueCode-error"
                role="alert"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {errors.venueCode.message}
              </p>
            ) : null}
          </label>
        </div>

        {sedes.isError ? (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            <p>No fue posible cargar las sedes activas.</p>
            <button
              type="button"
              onClick={() => void sedes.refetch()}
              className="mt-2 font-semibold underline"
            >
              Reintentar
            </button>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to={RUTAS.ADMIN_EVENTOS}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancelar
          </Link>

          <Boton
            type="submit"
            cargando={isSubmitting}
            textoCargando="Creando evento..."
          >
            Guardar borrador
          </Boton>
        </div>
      </form>
    </main>
  )
}