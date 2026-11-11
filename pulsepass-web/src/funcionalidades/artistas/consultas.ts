import { useQuery } from '@tanstack/react-query'
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
    [...clavesArtistas.todos, 'detalle', id] as const,
  nombre: (nombreArtistico: string) =>
    [
      ...clavesArtistas.todos,
      'nombre',
      nombreArtistico,
    ] as const,
}

export function useArtistasActivos() {
  return useQuery({
    queryKey: clavesArtistas.activos(),
    queryFn: obtenerArtistasActivosApi,
  })
}

export function useArtistaPorId(id: number | null) {
  return useQuery({
    queryKey: clavesArtistas.detalle(id ?? 0),
    queryFn: () => obtenerArtistaPorIdApi(id ?? 0),
    enabled: id !== null && Number.isInteger(id) && id > 0,
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
  })
}