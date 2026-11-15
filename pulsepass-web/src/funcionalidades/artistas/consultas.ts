import { useQuery } from '@tanstack/react-query'
import { TIEMPOS_CACHE } from '../../lib/query-client'
import {
  obtenerArtistaPorIdApi,
  obtenerArtistaPorNombreApi,
  obtenerArtistasActivosApi,
} from './api'

export const clavesArtistas = {
  todos: ['artistas'] as const,
  activos: () =>
    [...clavesArtistas.todos, 'activos'] as const,
  detalle: (id: number) =>
    ['artista', id] as const,
  nombre: (nombreArtistico: string) =>
    ['artista', 'nombre', nombreArtistico] as const,
}

export function useArtistasActivos() {
  return useQuery({
    queryKey: clavesArtistas.activos(),
    queryFn: obtenerArtistasActivosApi,
    staleTime: TIEMPOS_CACHE.artistas,
  })
}

export function useArtistaPorId(id: number | null) {
  return useQuery({
    queryKey: clavesArtistas.detalle(id ?? 0),
    queryFn: () => obtenerArtistaPorIdApi(id ?? 0),
    enabled: id !== null && Number.isInteger(id) && id > 0,
    staleTime: TIEMPOS_CACHE.artistas,
  })
}

export function useArtistaPorNombre(
  nombreArtistico: string,
) {
  return useQuery({
    queryKey: clavesArtistas.nombre(nombreArtistico),
    queryFn: () =>
      obtenerArtistaPorNombreApi(nombreArtistico),
    enabled: nombreArtistico.trim().length > 0,
    staleTime: TIEMPOS_CACHE.artistas,
  })
}
