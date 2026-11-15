import { z } from 'zod'

export const SedeSchema = z.object({
  id: z.number().int().positive(),
  code: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
  capacity: z.number().int().nonnegative(),
  active: z.boolean(),
})

export const ListaSedesSchema = z.array(SedeSchema)

export type Sede = z.infer<typeof SedeSchema>
