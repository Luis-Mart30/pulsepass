import { useQuery } from '@tanstack/react-query'
import { TIEMPOS_CACHE } from '../../lib/query-client'
import {
  obtenerSedePorCodigoApi,
  obtenerSedesActivasApi,
} from './api'

export const clavesSedes = {
  todas: ['sedes'] as const,
  activas: () => [...clavesSedes.todas, 'activas'] as const,
  detalle: (codigo: string) =>
    ['sede', codigo] as const,
}

export function useSedesActivas() {
  return useQuery({
    queryKey: clavesSedes.activas(),
    queryFn: obtenerSedesActivasApi,
    staleTime: TIEMPOS_CACHE.sedes,
  })
}

export function useSedePorCodigo(codigo: string) {
  return useQuery({
    queryKey: clavesSedes.detalle(codigo),
    queryFn: () => obtenerSedePorCodigoApi(codigo),
    enabled: codigo.trim().length > 0,
    staleTime: TIEMPOS_CACHE.sedes,
  })
}
