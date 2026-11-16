import { z } from 'zod'

export const IdArtistaSchema = z.number().int().positive()

export const ArtistaSchema = z.object({
  id: IdArtistaSchema,
  stageName: z.string().min(1),
  country: z.string().min(1),
  genre: z.string().min(1),
  active: z.boolean(),
})

export const ListaArtistasSchema = z.array(ArtistaSchema)

export type Artista = z.infer<typeof ArtistaSchema>
