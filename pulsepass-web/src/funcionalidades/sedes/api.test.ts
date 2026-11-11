import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { ApiError } from '../../lib/http'
import {
  obtenerSedePorCodigoApi,
  obtenerSedesActivasApi,
} from './api'

describe('API pública de sedes', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('obtiene las sedes activas', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 1,
            code: 'VEN-001',
            name: 'Estadio PulsePass',
            city: 'Santa Marta',
            address: 'Carrera 1 # 10-20',
            capacity: 15000,
            active: true,
          },
        ]),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(obtenerSedesActivasApi()).resolves.toEqual([
      expect.objectContaining({
        code: 'VEN-001',
        name: 'Estadio PulsePass',
        active: true,
      }),
    ])

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/venues/active',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    )
  })

  it('obtiene una sede por su código', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 2,
          code: 'VEN COSTA',
          name: 'Arena Costa',
          city: 'Barranquilla',
          address: 'Calle 50 # 20-10',
          capacity: 8000,
          active: true,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(
      obtenerSedePorCodigoApi('VEN COSTA'),
    ).resolves.toMatchObject({
      id: 2,
      code: 'VEN COSTA',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/venues/VEN%20COSTA',
      expect.any(Object),
    )
  })

  it('rechaza respuestas con datos incompletos', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          code: 'VEN-001',
          name: 'Sede incompleta',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(
      obtenerSedePorCodigoApi('VEN-001'),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('rechaza una capacidad negativa', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          code: 'VEN-001',
          name: 'Sede inválida',
          city: 'Santa Marta',
          address: 'Dirección de prueba',
          capacity: -1,
          active: true,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(
      obtenerSedePorCodigoApi('VEN-001'),
    ).rejects.toMatchObject({
      status: 500,
    })
  })
})