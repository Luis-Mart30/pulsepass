import { http } from '../../lib/http'
import { ListaSedesSchema, SedeSchema, type Sede } from './tipos'

export function obtenerSedesActivasApi(): Promise<Sede[]> {
  return http('/venues/active', ListaSedesSchema)
}

export function obtenerSedePorCodigoApi(codigo: string): Promise<Sede> {
  return http(`/venues/${encodeURIComponent(codigo)}`, SedeSchema)
}
