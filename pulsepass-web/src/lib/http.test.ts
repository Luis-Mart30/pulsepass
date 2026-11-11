import { z } from 'zod'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  ApiError,
  establecerManejador401,
  establecerTokenHttp,
  http,
} from './http'

const RespuestaPruebaSchema = z.object({
  ok: z.boolean(),
})

describe('cliente HTTP', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    establecerTokenHttp(null)
    establecerManejador401(() => undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('envía el token únicamente en Authorization', async () => {
    fetchMock.mockImplementation(async (_entrada, opciones) => {
      const headers = new Headers(opciones?.headers)

      expect(headers.get('Authorization')).toBe(
        'Bearer token-seguro',
      )

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    establecerTokenHttp('token-seguro')

    await expect(
      http('/prueba', RespuestaPruebaSchema),
    ).resolves.toEqual({ ok: true })
  })

  it('convierte el contrato de error en ApiError', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          timestamp: '2026-11-11T00:00:00Z',
          status: 409,
          error: 'Conflict',
          message: 'Operación no permitida',
          details: {},
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(
      http('/prueba', RespuestaPruebaSchema),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'Operación no permitida',
    })
  })

  it('ejecuta el manejador central ante un 401', async () => {
    const manejador = vi.fn()

    establecerManejador401(manejador)

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          timestamp: '2026-11-11T00:00:00Z',
          status: 401,
          error: 'Unauthorized',
          message: 'No autenticado',
          details: {},
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(
      http('/privado', RespuestaPruebaSchema),
    ).rejects.toBeInstanceOf(ApiError)

    expect(manejador).toHaveBeenCalledOnce()
  })

  it('rechaza respuestas exitosas con estructura inválida', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ dato: 'incorrecto' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      http('/prueba', RespuestaPruebaSchema),
    ).rejects.toMatchObject({
      status: 500,
      message:
        'La respuesta del servidor no tiene el formato esperado.',
    })
  })
})