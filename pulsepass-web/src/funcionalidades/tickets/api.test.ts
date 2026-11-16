import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cancelarTicketApi,
  comprarTicketApi,
  marcarTicketUsadoApi,
  obtenerTicketPorCodigoApi,
  obtenerTicketsPagadosPorEventoApi,
  obtenerTicketsPorUsuarioApi,
} from './api'

const ticketRespuesta = {
  id: 1,
  ticketCode: 'TKT-8F2A1C',
  type: 'VIP',
  price: 250000,
  status: 'PAID',
  purchaseDate: '2026-11-05T14:32:00',
  userEmail: 'andrea@pulsepass.test',
  eventCode: 'CMF-2026',
  eventName: 'Caribbean Music Fest 2026',
}

function respuestaJson(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('API de tickets', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('compra un ticket', async () => {
    fetchMock.mockResolvedValue(respuestaJson(ticketRespuesta, 201))

    await expect(
      comprarTicketApi({
        userEmail: 'andrea@pulsepass.test',
        eventCode: 'CMF-2026',
        type: 'VIP',
      }),
    ).resolves.toMatchObject({
      ticketCode: 'TKT-8F2A1C',
      status: 'PAID',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tickets',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          userEmail: 'andrea@pulsepass.test',
          eventCode: 'CMF-2026',
          type: 'VIP',
        }),
      }),
    )
  })

  it('obtiene un ticket por código', async () => {
    fetchMock.mockResolvedValue(respuestaJson(ticketRespuesta))

    await obtenerTicketPorCodigoApi('TKT-8F2A1C')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tickets/TKT-8F2A1C',
      expect.any(Object),
    )
  })

  it('obtiene los tickets del usuario', async () => {
    fetchMock.mockResolvedValue(respuestaJson([ticketRespuesta]))

    await obtenerTicketsPorUsuarioApi('andrea@pulsepass.test')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tickets/by-user?email=andrea%40pulsepass.test',
      expect.any(Object),
    )
  })

  it('obtiene los tickets pagados del evento', async () => {
    fetchMock.mockResolvedValue(respuestaJson([ticketRespuesta]))

    await obtenerTicketsPagadosPorEventoApi('CMF-2026')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events/CMF-2026/tickets/paid',
      expect.any(Object),
    )
  })

  it('cancela un ticket', async () => {
    fetchMock.mockResolvedValue(
      respuestaJson({
        ...ticketRespuesta,
        status: 'CANCELLED',
      }),
    )

    await cancelarTicketApi('TKT-8F2A1C')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tickets/TKT-8F2A1C/cancel',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('marca un ticket como utilizado', async () => {
    fetchMock.mockResolvedValue(
      respuestaJson({
        ...ticketRespuesta,
        status: 'USED',
      }),
    )

    await marcarTicketUsadoApi('TKT-8F2A1C')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tickets/TKT-8F2A1C/use',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('rechaza una compra inválida antes de consultar', () => {
    expect(() =>
      comprarTicketApi({
        userEmail: 'correo-invalido',
        eventCode: '',
        type: 'VIP',
      }),
    ).toThrow()

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
