import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  agregarArtistaAEventoApi,
  crearEventoApi,
  obtenerEventoPorCodigoApi,
  obtenerEventosPorArtistaApi,
  obtenerEventosPublicadosApi,
  publicarEventoApi,
} from './api'

export const clavesEventos = {
  todos: ['eventos'] as const,
  publicados: () =>
    [...clavesEventos.todos, 'publicados'] as const,
  detalle: (codigo: string) =>
    [...clavesEventos.todos, 'detalle', codigo] as const,
  porArtista: (nombreArtistico: string) =>
    [
      ...clavesEventos.todos,
      'artista',
      nombreArtistico,
    ] as const,
}

export function useEventosPublicados(habilitado = true) {
  return useQuery({
    queryKey: clavesEventos.publicados(),
    queryFn: obtenerEventosPublicadosApi,
    enabled: habilitado,
  })
}

export function useEventoPorCodigo(codigo: string) {
  return useQuery({
    queryKey: clavesEventos.detalle(codigo),
    queryFn: () => obtenerEventoPorCodigoApi(codigo),
    enabled: codigo.trim().length > 0,
  })
}

export function useEventosPorArtista(
  nombreArtistico: string,
) {
  return useQuery({
    queryKey: clavesEventos.porArtista(nombreArtistico),
    queryFn: () =>
      obtenerEventosPorArtistaApi(nombreArtistico),
    enabled: nombreArtistico.trim().length > 0,
  })
}

export function useCrearEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: crearEventoApi,
    onSuccess: (evento) => {
      queryClient.setQueryData(
        clavesEventos.detalle(evento.eventCode),
        evento,
      )

      void queryClient.invalidateQueries({
        queryKey: clavesEventos.todos,
      })
    },
  })
}

export function usePublicarEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: publicarEventoApi,
    onSuccess: (evento) => {
      queryClient.setQueryData(
        clavesEventos.detalle(evento.eventCode),
        evento,
      )

      void queryClient.invalidateQueries({
        queryKey: clavesEventos.todos,
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
    mutationFn: ({
      codigo,
      artistaId,
    }: AgregarArtistaVariables) =>
      agregarArtistaAEventoApi(codigo, artistaId),
    onSuccess: (evento) => {
      queryClient.setQueryData(
        clavesEventos.detalle(evento.eventCode),
        evento,
      )

      void queryClient.invalidateQueries({
        queryKey: clavesEventos.todos,
      })
    },
  })
}
