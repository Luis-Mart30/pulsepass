import { z } from 'zod'
import { http } from '../../lib/http'
import {
  CompraTicketSchema,
  ListaTicketsSchema,
  TicketSchema,
  type CompraTicketDatos,
  type Ticket,
} from './tipos'

const CodigoSchema = z.string().trim().min(1)
const EmailSchema = z.email()

export function comprarTicketApi(
  datos: CompraTicketDatos,
): Promise<Ticket> {
  const datosValidados = CompraTicketSchema.parse(datos)

  return http('/tickets', TicketSchema, {
    method: 'POST',
    body: JSON.stringify(datosValidados),
  })
}

export function obtenerTicketPorCodigoApi(
  ticketCode: string,
): Promise<Ticket> {
  const codigo = CodigoSchema.parse(ticketCode)

  return http(
    `/tickets/${encodeURIComponent(codigo)}`,
    TicketSchema,
  )
}

export function obtenerTicketsPorUsuarioApi(
  email: string,
): Promise<Ticket[]> {
  const emailValidado = EmailSchema.parse(email)

  return http(
    `/tickets/by-user?email=${encodeURIComponent(emailValidado)}`,
    ListaTicketsSchema,
  )
}

export function obtenerTicketsPagadosPorEventoApi(
  eventCode: string,
): Promise<Ticket[]> {
  const codigo = CodigoSchema.parse(eventCode)

  return http(
    `/events/${encodeURIComponent(codigo)}/tickets/paid`,
    ListaTicketsSchema,
  )
}

export function cancelarTicketApi(
  ticketCode: string,
): Promise<Ticket> {
  const codigo = CodigoSchema.parse(ticketCode)

  return http(
    `/tickets/${encodeURIComponent(codigo)}/cancel`,
    TicketSchema,
    { method: 'PATCH' },
  )
}

export function marcarTicketUsadoApi(
  ticketCode: string,
): Promise<Ticket> {
  const codigo = CodigoSchema.parse(ticketCode)

  return http(
    `/tickets/${encodeURIComponent(codigo)}/use`,
    TicketSchema,
    { method: 'PATCH' },
  )
}