import { useQuery } from '@tanstack/react-query'
import { obtenerUsuarioPorEmailApi } from './api'

export const clavesUsuarios = {
  todas: ['usuarios'] as const,
  porEmail: (email: string) =>
    [...clavesUsuarios.todas, 'email', email] as const,
}

export function useUsuarioPorEmail(email: string) {
  return useQuery({
    queryKey: clavesUsuarios.porEmail(email),
    queryFn: () => obtenerUsuarioPorEmailApi(email),
    enabled: email.trim().length > 0,
  })
}