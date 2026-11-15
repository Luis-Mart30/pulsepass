import { useQuery } from '@tanstack/react-query'
import { TIEMPOS_CACHE } from '../../lib/query-client'
import {
  obtenerUsuarioPorEmailApi,
  obtenerUsuarioPorUsernameApi,
} from './api'

export const clavesUsuarios = {
  porEmail: (email: string) =>
    ['usuario', email] as const,
  porUsername: (username: string) =>
    ['usuario', 'username', username] as const,
}

export function useUsuarioPorUsername(username: string) {
  return useQuery({
    queryKey: clavesUsuarios.porUsername(username),
    queryFn: () => obtenerUsuarioPorUsernameApi(username),
    enabled: username.trim().length > 0,
    staleTime: TIEMPOS_CACHE.usuario,
  })
}

export function useUsuarioPorEmail(email: string) {
  return useQuery({
    queryKey: clavesUsuarios.porEmail(email),
    queryFn: () => obtenerUsuarioPorEmailApi(email),
    enabled: email.trim().length > 0,
    staleTime: TIEMPOS_CACHE.usuario,
  })
}
