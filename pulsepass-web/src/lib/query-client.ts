import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './http'

export const TIEMPOS_CACHE = {
  eventosPublicados: 60_000,
  evento: 30_000,
  eventosPorArtista: 60_000,
  artistas: 300_000,
  sedes: 300_000,
  usuario: 60_000,
  tickets: 15_000,
} as const

export function debeReintentarConsulta(
  intentosFallidos: number,
  error: unknown,
): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false
  }

  return intentosFallidos < 1
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: debeReintentarConsulta,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
