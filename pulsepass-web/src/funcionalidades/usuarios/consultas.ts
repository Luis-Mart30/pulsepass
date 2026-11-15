import { useQuery } from '@tanstack/react-query'
import {
  obtenerUsuarioPorEmailApi,
  obtenerUsuarioPorUsernameApi,
} from './api'

export const clavesUsuarios = {
  todas: ['usuarios'] as const,
  porEmail: (email: string) =>
    [...clavesUsuarios.todas, 'email', email] as const,
  porUsername: (username: string) =>
    [...clavesUsuarios.todas, 'username', username] as const,
}

export function useUsuarioPorUsername(username: string) {
  return useQuery({
    queryKey: clavesUsuarios.porUsername(username),
    queryFn: () => obtenerUsuarioPorUsernameApi(username),
    enabled: username.trim().length > 0,
  })
}

export function useUsuarioPorEmail(email: string) {
  return useQuery({
    queryKey: clavesUsuarios.porEmail(email),
    queryFn: () => obtenerUsuarioPorEmailApi(email),
    enabled: email.trim().length > 0,
  })
}
