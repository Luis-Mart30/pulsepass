import { z } from 'zod'

export const TipoTicketSchema = z.enum([
  'GENERAL',
  'VIP',
  'BACKSTAGE',
  'STUDENT',
])

export const EstadoTicketSchema = z.enum([
  'RESERVED',
  'PAID',
  'CANCELLED',
  'USED',
])

export const TicketSchema = z.object({
  id: z.number().int().positive(),
  ticketCode: z.string().min(1),
  type: TipoTicketSchema,
  price: z.number().nonnegative(),
  status: EstadoTicketSchema,
  purchaseDate: z.string().min(1),
  userEmail: z.email(),
  eventCode: z.string().min(1),
  eventName: z.string().min(1),
})

export const ListaTicketsSchema = z.array(TicketSchema)

export const CompraTicketSchema = z.object({
  userEmail: z.email(),
  eventCode: z.string().trim().min(1),
  type: TipoTicketSchema,
})

export type TipoTicket = z.infer<typeof TipoTicketSchema>
export type EstadoTicket = z.infer<typeof EstadoTicketSchema>
export type Ticket = z.infer<typeof TicketSchema>
export type CompraTicketDatos = z.infer<
  typeof CompraTicketSchema
>