import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  agregarArtistaAEventoApi,
  crearEventoApi,
  obtenerEventoPorCodigoApi,
  obtenerEventosPorArtistaApi,
  obtenerTodosEventosApi,
  obtenerEventosPublicadosApi,
  publicarEventoApi,
} from './api'

describe('API de eventos', () => {
  const fetchMock = vi.fn<typeof fetch>()

  const resumen = {
    id: 1,
    eventCode: 'CMF-2026',
    name: 'Caribbean Music Fest 2026',
    category: 'MUSIC',
    status: 'PUBLISHED',
    eventDate: '2026-12-20T19:00:00',
    minimumAge: 18,
    venueCode: 'VEN-SMR-01',
    venueName: 'Marina Convention Center',
  } as const

  const evento = {
    ...resumen,
    description: 'Festival musical',
    artists: [],
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  function responderConEvento() {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(evento), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }

  it('obtiene todos los eventos para administración', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([resumen]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(obtenerTodosEventosApi()).resolves.toEqual([
      resumen,
    ])

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events',
      expect.any(Object),
    )
  })

  it('obtiene los eventos publicados', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([resumen]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      obtenerEventosPublicadosApi(),
    ).resolves.toEqual([resumen])

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events/published',
      expect.any(Object),
    )
  })

  it('obtiene el detalle usando el código codificado', async () => {
    responderConEvento()

    await obtenerEventoPorCodigoApi('CMF 2026')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events/CMF%202026',
      expect.any(Object),
    )
  })

  it('filtra eventos por nombre artístico', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([resumen]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await obtenerEventosPorArtistaApi('Solar Beat')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events/by-artist?stageName=Solar+Beat',
      expect.any(Object),
    )
  })

  it('crea un evento válido', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(evento), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const datos = {
      eventCode: 'CMF-2026',
      name: 'Caribbean Music Fest 2026',
      description: 'Festival musical',
      category: 'MUSIC',
      eventDate: '2026-12-20T19:00:00',
      minimumAge: 18,
      venueCode: 'VEN-SMR-01',
    } as const

    await expect(crearEventoApi(datos)).resolves.toEqual(
      evento,
    )

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(datos),
      }),
    )
  })

  it('publica un evento', async () => {
    responderConEvento()

    await publicarEventoApi('CMF-2026')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events/CMF-2026/publish',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('asocia un artista con un evento', async () => {
    responderConEvento()

    await agregarArtistaAEventoApi('CMF-2026', 20)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events/CMF-2026/artists/20',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('rechaza datos inválidos antes de crear el evento', async () => {
    await expect(
      crearEventoApi({
        eventCode: '',
        name: '',
        description: null,
        category: 'MUSIC',
        eventDate: 'fecha-inválida',
        minimumAge: -1,
        venueCode: '',
      }),
    ).rejects.toBeDefined()

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
