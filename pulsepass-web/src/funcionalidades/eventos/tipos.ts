import { z } from 'zod'
import { ArtistaSchema } from '../artistas/tipos'

export const CategoriaEventoSchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])

export const EstadoEventoSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'SOLD_OUT',
  'CANCELLED',
  'FINISHED',
])

export const FechaLocalSchema = z.iso.datetime({
  local: true,
})

const CamposResumenEventoSchema = z.object({
  id: z.number().int().positive(),
  eventCode: z.string().min(1),
  name: z.string().min(1),
  category: CategoriaEventoSchema,
  status: EstadoEventoSchema,
  eventDate: FechaLocalSchema,
  minimumAge: z.number().int().nonnegative(),
  venueCode: z.string().min(1),
  venueName: z.string().min(1),
})

export const ResumenEventoSchema =
  CamposResumenEventoSchema

export const EventoSchema = CamposResumenEventoSchema.extend({
  description: z.string().max(1000).nullable(),
  artists: z.array(ArtistaSchema),
})

export const ListaResumenEventosSchema = z.array(
  ResumenEventoSchema,
)

export const CrearEventoSchema = z.object({
  eventCode: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().max(1000).nullable(),
  category: CategoriaEventoSchema,
  eventDate: FechaLocalSchema,
  minimumAge: z.number().int().nonnegative(),
  venueCode: z.string().trim().min(1),
})

export type CategoriaEvento = z.infer<
  typeof CategoriaEventoSchema
>
export type EstadoEvento = z.infer<
  typeof EstadoEventoSchema
>
export type ResumenEvento = z.infer<
  typeof ResumenEventoSchema
>
export type Evento = z.infer<typeof EventoSchema>
export type CrearEventoDatos = z.infer<
  typeof CrearEventoSchema
>