import '../componentes/ExperienciaPulsePass.css'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { IconoDato } from '../componentes/IconoDato'
import { IlustracionSeccion } from '../componentes/IlustracionSeccion'
import { useCrearEvento } from '../funcionalidades/eventos/consultas'
import {
  CrearEventoSchema,
  type CrearEventoDatos,
} from '../funcionalidades/eventos/tipos'
import { useSedesActivas } from '../funcionalidades/sedes/consultas'
import { formatearFechaEvento, obtenerEtiquetaCategoria } from '../lib/formatos'
import { ApiError } from '../lib/http'
import { crearRuta, RUTAS } from '../lib/rutas'

const LIMITE_DESCRIPCION = 1000
const FORMATO_HORA = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const FechaFormularioSchema = z.iso.date('Ingresa una fecha válida.')

const FormularioEventoSchema = CrearEventoSchema.extend({
  description: z
    .string()
    .max(LIMITE_DESCRIPCION, 'La descripción no puede superar 1000 caracteres'),
  eventDate: FechaFormularioSchema,
  venueCode: z.string().trim().min(1, 'Selecciona una sede activa.'),
  eventTime: z
    .string()
    .trim()
    .regex(
      FORMATO_HORA,
      'Escribe la hora en formato de 24 horas, por ejemplo 19:00.',
    ),
})

type FormularioEventoDatos = z.infer<typeof FormularioEventoSchema>

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

function esCampoEvento(campo: string): campo is keyof FormularioEventoDatos {
  return CAMPOS_EVENTO.has(campo as keyof FormularioEventoDatos)
}

export default function AdminCrearEvento() {
  const navigate = useNavigate()
  const crearEvento = useCrearEvento()
  const sedes = useSedesActivas()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    control,
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
      eventTime: '',
      minimumAge: 0,
      venueCode: '',
    },
  })

  const borrador = useWatch({ control })
  const sedeSeleccionada = sedes.data?.find(
    (sede) => sede.code === borrador.venueCode,
  )
  const horaBorrador = borrador.eventTime?.trim() ?? ''
  const fechaBorrador = FechaFormularioSchema.safeParse(borrador.eventDate)
  const fechaPrevia =
    fechaBorrador.success && FORMATO_HORA.test(horaBorrador)
      ? formatearFechaEvento(`${fechaBorrador.data}T${horaBorrador}:00`)
      : 'Por definir'
  const sinSedes = sedes.isSuccess && sedes.data.length === 0
  const indicacionSede = sedes.isPending
    ? 'Cargando sedes…'
    : sedes.isError
      ? 'Sedes no disponibles'
      : sinSedes
        ? 'No hay sedes activas'
        : 'Selecciona una sede'

  const enviar = async (formulario: FormularioEventoDatos): Promise<void> => {
    setErrorGeneral(null)

    const { eventDate, eventTime, description, ...otrosDatos } = formulario
    const datos: CrearEventoDatos = {
      ...otrosDatos,
      eventDate: `${eventDate}T${eventTime}:00`,
      description: description.trim() || null,
    }

    try {
      const evento = await crearEvento.mutateAsync(datos)

      navigate(crearRuta.gestionEvento(evento.eventCode), {
        replace: true,
        state: { creado: true },
      })
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          navigate(RUTAS.SIN_PERMISOS, { replace: true })
          return
        }

        if (error.status === 400) {
          let detalleMapeado = false

          Object.entries(error.details).forEach(([campo, mensaje]) => {
            if (esCampoEvento(campo)) {
              setError(campo, {
                type: 'server',
                message: mensaje,
              })
              detalleMapeado = true
            }
          })

          if (!detalleMapeado) {
            setErrorGeneral(
              'Revisa los datos ingresados e inténtalo nuevamente.',
            )
          }

          return
        }

        if (error.status === 409 || error.status === 404) {
          const mensaje = error.message
          if (mensaje.startsWith('Event code already exists')) {
            setErrorGeneral('Ya existe un evento registrado con ese código.')
          } else if (mensaje === 'Event date must be in the future.') {
            setErrorGeneral(
              'La fecha y hora del evento deben estar en el futuro.',
            )
          } else if (
            mensaje === 'Venue must be active.' ||
            mensaje.startsWith('Venue not found:')
          ) {
            setErrorGeneral(
              'La sede seleccionada ya no está disponible. Selecciona otra sede.',
            )
          } else {
            setErrorGeneral(
              'Revisa la disponibilidad de la sede, la fecha y el código del evento.',
            )
          }
          return
        }
      }

      setErrorGeneral('No fue posible crear el evento. Inténtalo nuevamente.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
      <header className="crear-evento-portada mb-6 flex items-center justify-between gap-4 rounded-3xl p-5 sm:p-7">
        <div className="min-w-0">
          <Link
            to={RUTAS.ADMIN_EVENTOS}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-violet-200 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            ← Volver a eventos
          </Link>
          <h1 className="titulo-pulsepass mt-1 text-3xl font-extrabold sm:text-5xl">
            Crear evento
          </h1>
          <p className="mt-2 text-sm text-violet-100 sm:text-base">
            El evento se guardará inicialmente como borrador.
          </p>
        </div>
        <IlustracionSeccion tipo="entradas" />
      </header>

      <div className="crear-evento-contenido grid items-start gap-5">
        <form
          noValidate
          onSubmit={handleSubmit(enviar)}
          className="crear-evento-formulario panel-operativo tarjeta-operacion min-w-0 rounded-3xl border border-violet-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900"
        >
          {errorGeneral !== null ? (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
            >
              {errorGeneral}
            </div>
          ) : null}

          <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
            <legend className="panel-titulo font-titulo mb-4 text-lg font-extrabold text-slate-950 dark:text-white">
              <IconoDato tipo="codigo" />
              Datos del evento
            </legend>
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

            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Descripción
                </label>
                <span
                  className="text-xs text-slate-600 tabular-nums dark:text-slate-300"
                  aria-hidden="true"
                >
                  {borrador.description?.length ?? 0}/{LIMITE_DESCRIPCION}
                </span>
              </div>
              <textarea
                id="description"
                rows={3}
                maxLength={LIMITE_DESCRIPCION}
                aria-invalid={errors.description !== undefined}
                aria-describedby={
                  errors.description !== undefined
                    ? 'description-error'
                    : undefined
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 transition outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Categoría
              </label>
              <select
                id="category"
                aria-invalid={errors.category !== undefined}
                aria-describedby={
                  errors.category !== undefined ? 'category-error' : undefined
                }
                className="selector-pulsepass min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 transition outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('category')}
              >
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria.valor} value={categoria.valor}>
                    {categoria.etiqueta}
                  </option>
                ))}
              </select>
              {errors.category !== undefined ? (
                <p
                  id="category-error"
                  role="alert"
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  {errors.category.message}
                </p>
              ) : null}
            </div>

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
          </fieldset>
          <fieldset className="panel-superficie mt-6 min-w-0 rounded-xl border p-4">
            <legend className="panel-titulo px-2">
              <IconoDato tipo="fecha" />
              Fecha y hora
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                id="eventDate"
                etiqueta="Fecha del evento"
                type="date"
                error={errors.eventDate?.message}
                {...register('eventDate')}
              />
              <Campo
                id="eventTime"
                etiqueta="Hora (24 horas)"
                type="text"
                placeholder="19:00"
                autoComplete="off"
                aria-describedby="ayuda-hora-evento"
                className="font-mono tabular-nums"
                error={errors.eventTime?.message}
                {...register('eventTime')}
              />
            </div>
            <p
              id="ayuda-hora-evento"
              className="mt-3 text-sm text-slate-600 dark:text-slate-300"
            >
              Por ejemplo, 19:00 equivale a 7:00 p. m.
            </p>
          </fieldset>

          <div className="mt-5 min-w-0 space-y-2">
            <label
              htmlFor="venueCode"
              className="panel-titulo block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              <IconoDato tipo="lugar" />
              Sede
            </label>
            <select
              id="venueCode"
              required
              disabled={sedes.isPending || sedes.isError || sinSedes}
              aria-invalid={errors.venueCode !== undefined}
              aria-describedby={
                errors.venueCode !== undefined ? 'venueCode-error' : undefined
              }
              className="selector-pulsepass min-h-12 w-full rounded-xl border border-violet-200 bg-white px-3 text-slate-900 transition disabled:opacity-70 dark:border-violet-900 dark:bg-slate-950 dark:text-slate-100"
              {...register('venueCode')}
            >
              <option value="" disabled hidden>
                {indicacionSede}
              </option>
              {sedes.data?.map((sede) => (
                <option key={sede.code} value={sede.code}>
                  {sede.name} — {sede.city}
                </option>
              ))}
            </select>

            {sedeSeleccionada !== undefined ? (
              <dl className="panel-superficie min-w-0 rounded-xl border px-4 py-3 text-sm">
                <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Sede seleccionada
                </dt>
                <dd className="mt-1 font-semibold wrap-anywhere text-slate-950 dark:text-white">
                  {sedeSeleccionada.name}
                </dd>
                <dd className="mt-1 wrap-anywhere text-slate-600 dark:text-slate-300">
                  {sedeSeleccionada.city} · {sedeSeleccionada.code}
                </dd>
              </dl>
            ) : null}

            {errors.venueCode !== undefined ? (
              <p
                id="venueCode-error"
                role="alert"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {errors.venueCode.message}
              </p>
            ) : null}
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

          <div className="crear-evento-acciones mt-6 flex flex-col-reverse gap-3 pt-5 sm:flex-row sm:justify-end">
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

        <aside
          aria-labelledby="vista-borrador"
          className="crear-evento-previa min-w-0 overflow-hidden rounded-3xl border"
        >
          <div className="crear-evento-previa-cabecera p-5 sm:p-6">
            <h2
              id="vista-borrador"
              className="text-sm font-semibold text-violet-100"
            >
              Vista previa del borrador
            </h2>
            <p className="mt-4 inline-flex max-w-full rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              {obtenerEtiquetaCategoria(borrador.category ?? 'MUSIC')}
            </p>
            <p className="titulo-pulsepass mt-3 text-2xl leading-tight text-white">
              {borrador.name?.trim() || 'Nombre del evento'}
            </p>
            {borrador.eventCode?.trim() ? (
              <p className="mt-2 font-mono text-sm wrap-anywhere text-violet-100">
                {borrador.eventCode.trim()}
              </p>
            ) : null}
          </div>
          <dl className="crear-evento-talon grid gap-4 p-5 text-sm sm:p-6">
            <div>
              <dt>
                <IconoDato tipo="fecha" /> Fecha y hora
              </dt>
              <dd>{fechaPrevia}</dd>
            </div>
            <div>
              <dt>
                <IconoDato tipo="lugar" /> Sede
              </dt>
              <dd>{sedeSeleccionada?.name ?? 'Por definir'}</dd>
              {sedeSeleccionada ? (
                <dd className="crear-evento-ciudad">{sedeSeleccionada.city}</dd>
              ) : null}
            </div>
            <div>
              <dt>
                <IconoDato tipo="edad" /> Edad mínima
              </dt>
              <dd>
                {borrador.minimumAge !== undefined &&
                Number.isInteger(borrador.minimumAge) &&
                borrador.minimumAge >= 0
                  ? `${borrador.minimumAge} años`
                  : 'Por definir'}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}
