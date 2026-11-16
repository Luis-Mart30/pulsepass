export const SECCION_TICKETS_PAGADOS = 'tickets-pagados'

export const RUTAS = {
  INICIO: '/',
  EVENTOS: '/eventos',
  DETALLE_EVENTO: '/eventos/:eventCode',
  ARTISTAS: '/artistas',
  DETALLE_ARTISTA: '/artistas/:id',
  SEDES: '/sedes',
  DETALLE_SEDE: '/sedes/:code',
  LOGIN: '/login',
  REGISTRO: '/registro',
  CUENTA: '/cuenta',
  MIS_TICKETS: '/mis-tickets',
  DETALLE_TICKET: '/mis-tickets/:ticketCode',
  CONFIRMACION_COMPRA: '/compra/confirmacion/:ticketCode',
  STAFF_VALIDACION: '/staff/validacion',
  STAFF_TICKETS_EVENTO: '/staff/eventos/:eventCode/tickets',
  ADMIN_EVENTOS: '/admin/eventos',
  ADMIN_CREAR_EVENTO: '/admin/eventos/nuevo',
  ADMIN_GESTION_EVENTO: '/admin/eventos/:eventCode',
  SIN_PERMISOS: '/403',
  NO_ENCONTRADA: '*',
} as const

export const crearRuta = {
  detalleEvento: (eventCode: string) =>
    `/eventos/${encodeURIComponent(eventCode)}`,
  detalleArtista: (id: number) => `/artistas/${id}`,
  detalleSede: (code: string) => `/sedes/${encodeURIComponent(code)}`,
  detalleTicket: (ticketCode: string) =>
    `/mis-tickets/${encodeURIComponent(ticketCode)}`,
  confirmacionCompra: (ticketCode: string) =>
    `/compra/confirmacion/${encodeURIComponent(ticketCode)}`,
  ticketsPagadosEvento: (eventCode: string) =>
    `/staff/eventos/${encodeURIComponent(eventCode)}/tickets`,
  gestionEvento: (eventCode: string) =>
    `/admin/eventos/${encodeURIComponent(eventCode)}`,
} as const
