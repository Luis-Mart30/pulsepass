import { http } from '../../lib/http'
import {
  CrearEventoSchema,
  EventoSchema,
  ListaResumenEventosSchema,
  type CrearEventoDatos,
  type Evento,
  type ResumenEvento,
} from './tipos'

export async function obtenerEventosPublicadosApi(): Promise<ResumenEvento[]> {
  return http('/events/published', ListaResumenEventosSchema)
}

export async function obtenerEventoPorCodigoApi(
  codigo: string,
): Promise<Evento> {
  return http(`/events/${encodeURIComponent(codigo)}`, EventoSchema)
}

export async function obtenerEventosPorArtistaApi(
  nombreArtistico: string,
): Promise<ResumenEvento[]> {
  const parametros = new URLSearchParams({
    stageName: nombreArtistico,
  })

  return http(
    `/events/by-artist?${parametros.toString()}`,
    ListaResumenEventosSchema,
  )
}

export async function crearEventoApi(datos: CrearEventoDatos): Promise<Evento> {
  const datosValidados = CrearEventoSchema.parse(datos)

  return http('/events', EventoSchema, {
    method: 'POST',
    body: JSON.stringify(datosValidados),
  })
}

export async function publicarEventoApi(codigo: string): Promise<Evento> {
  return http(`/events/${encodeURIComponent(codigo)}/publish`, EventoSchema, {
    method: 'PATCH',
  })
}

export async function agregarArtistaAEventoApi(
  codigo: string,
  artistaId: number,
): Promise<Evento> {
  if (!Number.isInteger(artistaId) || artistaId <= 0) {
    throw new Error('El identificador del artista no es válido.')
  }

  return http(
    `/events/${encodeURIComponent(codigo)}/artists/${artistaId}`,
    EventoSchema,
    { method: 'POST' },
  )
}
