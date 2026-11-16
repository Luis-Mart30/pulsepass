import { http } from '../../lib/http'
import {
  ArtistaSchema,
  IdArtistaSchema,
  ListaArtistasSchema,
  type Artista,
} from './tipos'

export function obtenerArtistasActivosApi(): Promise<Artista[]> {
  return http('/artists/active', ListaArtistasSchema)
}

export async function obtenerArtistaPorIdApi(id: number): Promise<Artista> {
  const idValidado = IdArtistaSchema.parse(id)

  return http(`/artists/${idValidado}`, ArtistaSchema)
}

export function obtenerArtistaPorNombreApi(
  nombreArtistico: string,
): Promise<Artista> {
  const parametros = new URLSearchParams({
    stageName: nombreArtistico,
  })

  return http(`/artists/by-stage-name?${parametros.toString()}`, ArtistaSchema)
}
