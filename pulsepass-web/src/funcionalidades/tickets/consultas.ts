import {
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { queryClient } from '../../lib/query-client'
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
  detalle: (ticketCode: string) =>
    [...clavesTickets.todas, 'detalle', ticketCode] as const,
  pagadosEvento: (eventCode: string) =>
    [...clavesTickets.todas, 'pagados', eventCode] as const,
}

export function useMisTickets(email: string) {
  return useQuery({
    queryKey: clavesTickets.porUsuario(email),
    queryFn: () => obtenerTicketsPorUsuarioApi(email),
    enabled: email.trim().length > 0,
  })
}

export function useTicket(ticketCode: string) {
  return useQuery({
    queryKey: clavesTickets.detalle(ticketCode),
    queryFn: () => obtenerTicketPorCodigoApi(ticketCode),
    enabled: ticketCode.trim().length > 0,
  })
}

export function useTicketsPagados(eventCode: string) {
  return useQuery({
    queryKey: clavesTickets.pagadosEvento(eventCode),
    queryFn: () =>
      obtenerTicketsPagadosPorEventoApi(eventCode),
    enabled: eventCode.trim().length > 0,
  })
}

export function useComprarTicket(email: string) {
  return useMutation({
    mutationFn: comprarTicketApi,
    onSuccess: (ticket) => {
      queryClient.setQueryData(
        clavesTickets.detalle(ticket.ticketCode),
        ticket,
      )

      return queryClient.invalidateQueries({
        queryKey: clavesTickets.porUsuario(email),
      })
    },
  })
}

export function useCancelarTicket(email: string) {
  return useMutation({
    mutationFn: cancelarTicketApi,
    onSuccess: (ticket) => {
      queryClient.setQueryData(
        clavesTickets.detalle(ticket.ticketCode),
        ticket,
      )

      return queryClient.invalidateQueries({
        queryKey: clavesTickets.porUsuario(email),
      })
    },
  })
}

export function useMarcarTicketUsado(eventCode: string) {
  return useMutation({
    mutationFn: marcarTicketUsadoApi,
    onSuccess: (ticket) => {
      queryClient.setQueryData(
        clavesTickets.detalle(ticket.ticketCode),
        ticket,
      )

      return queryClient.invalidateQueries({
        queryKey: clavesTickets.pagadosEvento(eventCode),
      })
    },
  })
}