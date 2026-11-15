import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { TIEMPOS_CACHE } from '../../lib/query-client'
import {
  agregarArtistaAEventoApi,
  crearEventoApi,
  obtenerEventoPorCodigoApi,
  obtenerEventosPorArtistaApi,
  obtenerEventosPublicadosApi,
  publicarEventoApi,
} from './api'

import type { Evento } from './tipos'

type EventoCreado = Pick<Evento, 'eventCode' | 'name' | 'status'>
const eventosCreadosKey = ['eventos-creados-en-sesion'] as const

export function useEventosCreadosEnSesion() {
  return (
    useQuery<EventoCreado[]>({
      queryKey: eventosCreadosKey,
      queryFn: skipToken,
      initialData: [],
      gcTime: Infinity,
    }).data ?? []
  )
}

export const clavesEventos = {
  todos: ['eventos'] as const,
  publicados: () => [...clavesEventos.todos, 'publicados'] as const,
  detalle: (codigo: string) => ['evento', codigo] as const,
  porArtista: (nombreArtistico: string) =>
    [...clavesEventos.todos, 'artista', nombreArtistico] as const,
}

export function useEventosPublicados(habilitado = true) {
  return useQuery({
    queryKey: clavesEventos.publicados(),
    queryFn: obtenerEventosPublicadosApi,
    enabled: habilitado,
    staleTime: TIEMPOS_CACHE.eventosPublicados,
  })
}

export function useEventoPorCodigo(codigo: string) {
  return useQuery({
    queryKey: clavesEventos.detalle(codigo),
    queryFn: () => obtenerEventoPorCodigoApi(codigo),
    enabled: codigo.trim().length > 0,
    staleTime: TIEMPOS_CACHE.evento,
  })
}

export function useEventosPorArtista(nombreArtistico: string) {
  return useQuery({
    queryKey: clavesEventos.porArtista(nombreArtistico),
    queryFn: () => obtenerEventosPorArtistaApi(nombreArtistico),
    enabled: nombreArtistico.trim().length > 0,
    staleTime: TIEMPOS_CACHE.eventosPorArtista,
  })
}

export function useCrearEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: crearEventoApi,
    onSuccess: (evento) => {
      queryClient.setQueryData(clavesEventos.detalle(evento.eventCode), evento)
      const { eventCode, name, status } = evento
      queryClient.setQueryDefaults(eventosCreadosKey, { gcTime: Infinity })
      queryClient.setQueryData<EventoCreado[]>(
        eventosCreadosKey,
        (eventos = []) => [
          { eventCode, name, status },
          ...eventos.filter((creado) => creado.eventCode !== eventCode),
        ],
      )
    },
  })
}

export function usePublicarEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: publicarEventoApi,
    onSuccess: (evento) => {
      queryClient.setQueryData(clavesEventos.detalle(evento.eventCode), evento)
      queryClient.setQueryData<EventoCreado[]>(eventosCreadosKey, (eventos) =>
        eventos?.map((creado) =>
          creado.eventCode === evento.eventCode
            ? { ...creado, status: evento.status }
            : creado,
        ),
      )

      void queryClient.invalidateQueries({
        queryKey: clavesEventos.publicados(),
      })
    },
  })
}

interface AgregarArtistaVariables {
  codigo: string
  artistaId: number
}

export function useAgregarArtistaAEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ codigo, artistaId }: AgregarArtistaVariables) =>
      agregarArtistaAEventoApi(codigo, artistaId),
    onSuccess: (evento, variables) => {
      queryClient.setQueryData(clavesEventos.detalle(evento.eventCode), evento)

      const artistaAgregado = evento.artists.find(
        (artista) => artista.id === variables.artistaId,
      )

      if (artistaAgregado !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: clavesEventos.porArtista(artistaAgregado.stageName),
        })
      }
    },
  })
}
