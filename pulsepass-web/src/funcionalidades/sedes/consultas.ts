import { useQuery } from '@tanstack/react-query'
import {
  obtenerSedePorCodigoApi,
  obtenerSedesActivasApi,
} from './api'

export const clavesSedes = {
  todas: ['sedes'] as const,
  activas: () => [...clavesSedes.todas, 'activas'] as const,
  detalle: (codigo: string) =>
    [...clavesSedes.todas, 'detalle', codigo] as const,
}

export function useSedesActivas() {
  return useQuery({
    queryKey: clavesSedes.activas(),
    queryFn: obtenerSedesActivasApi,
  })
}

export function useSedePorCodigo(codigo: string) {
  return useQuery({
    queryKey: clavesSedes.detalle(codigo),
    queryFn: () => obtenerSedePorCodigoApi(codigo),
    enabled: codigo.trim().length > 0,
  })
}