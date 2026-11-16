import type { CategoriaEvento } from '../funcionalidades/eventos/tipos'
import type { EstadoTicket, TipoTicket } from '../funcionalidades/tickets/tipos'

const etiquetasCategoria: Record<CategoriaEvento, string> = {
  MUSIC: 'Música',
  SPORTS: 'Deportes',
  TECHNOLOGY: 'Tecnología',
  EDUCATION: 'Educación',
  CULTURE: 'Cultura',
  ENTERTAINMENT: 'Entretenimiento',
}

const etiquetasTipoTicket: Record<TipoTicket, string> = {
  GENERAL: 'General',
  VIP: 'VIP',
  BACKSTAGE: 'Backstage',
  STUDENT: 'Estudiante',
}

const etiquetasEstadoTicket: Record<EstadoTicket, string> = {
  RESERVED: 'Reservado',
  PAID: 'Pagado',
  CANCELLED: 'Cancelado',
  USED: 'Usado',
}

export function obtenerEtiquetaCategoria(categoria: CategoriaEvento): string {
  return etiquetasCategoria[categoria]
}

export function formatearFechaEvento(fecha: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

export function obtenerEtiquetaTipoTicket(tipo: TipoTicket): string {
  return etiquetasTipoTicket[tipo]
}

export function obtenerEtiquetaEstadoTicket(estado: EstadoTicket): string {
  return etiquetasEstadoTicket[estado]
}

export function formatearPrecioCOP(precio: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(precio)
}

export function formatearFechaCompra(fecha: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(fecha))
}
