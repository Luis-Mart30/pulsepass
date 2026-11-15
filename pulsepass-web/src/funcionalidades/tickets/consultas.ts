import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clavesEventos } from '../eventos/consultas'
import { TIEMPOS_CACHE } from '../../lib/query-client'
import {
  cancelarTicketApi,
  comprarTicketApi,
  marcarTicketUsadoApi,
  obtenerTicketPorCodigoApi,
  obtenerTicketsPagadosPorEventoApi,
  obtenerTicketsPorUsuarioApi,
} from './api'

export const clavesTickets = {
  todas: ['tickets'] as const,
  porUsuario: (email: string) =>
    [...clavesTickets.todas, 'usuario', email] as const,
  detalle: (ticketCode: string) => ['ticket', ticketCode] as const,
  pagadosEvento: (eventCode: string) =>
    [...clavesTickets.todas, 'pagados', eventCode] as const,
}

export function useMisTickets(email: string) {
  return useQuery({
    queryKey: clavesTickets.porUsuario(email),
    queryFn: () => obtenerTicketsPorUsuarioApi(email),
    enabled: email.trim().length > 0,
    staleTime: TIEMPOS_CACHE.tickets,
  })
}

export function useTicket(ticketCode: string) {
  return useQuery({
    queryKey: clavesTickets.detalle(ticketCode),
    queryFn: () => obtenerTicketPorCodigoApi(ticketCode),
    enabled: ticketCode.trim().length > 0,
    staleTime: TIEMPOS_CACHE.tickets,
  })
}

export function useTicketsPagados(eventCode: string) {
  return useQuery({
    queryKey: clavesTickets.pagadosEvento(eventCode),
    queryFn: () => obtenerTicketsPagadosPorEventoApi(eventCode),
    enabled: eventCode.trim().length > 0,
    staleTime: TIEMPOS_CACHE.tickets,
  })
}

export function useComprarTicket(email: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: comprarTicketApi,
    onSuccess: (ticket) => {
      queryClient.setQueryData(clavesTickets.detalle(ticket.ticketCode), ticket)

      void queryClient.invalidateQueries({
        queryKey: clavesTickets.porUsuario(email),
      })
      void queryClient.invalidateQueries({
        queryKey: clavesEventos.detalle(ticket.eventCode),
      })
    },
  })
}

export function useCancelarTicket(email: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelarTicketApi,
    onSuccess: (ticket) => {
      queryClient.setQueryData(clavesTickets.detalle(ticket.ticketCode), ticket)

      void queryClient.invalidateQueries({
        queryKey: clavesTickets.porUsuario(email),
      })
      void queryClient.invalidateQueries({
        queryKey: clavesTickets.pagadosEvento(ticket.eventCode),
      })
    },
  })
}

export function useMarcarTicketUsado(eventCode: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: marcarTicketUsadoApi,
    onSuccess: (ticket) => {
      queryClient.setQueryData(clavesTickets.detalle(ticket.ticketCode), ticket)

      return queryClient.invalidateQueries({
        queryKey: clavesTickets.pagadosEvento(eventCode),
      })
    },
  })
}
