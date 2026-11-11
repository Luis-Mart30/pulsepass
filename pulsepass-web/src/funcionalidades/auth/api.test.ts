import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  establecerManejador401,
  establecerTokenHttp,
} from '../../lib/http'
import {
  iniciarSesionApi,
  obtenerUsuarioAutenticadoApi,
} from './api'

describe('API de autenticación', () => {
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

  it('valida la respuesta del login', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: 'jwt-de-prueba',
          tokenType: 'Bearer',
          expiresIn: 900,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(
      iniciarSesionApi({
        identifier: 'user_e2e',
        password: 'contraseña-de-prueba',
      }),
    ).resolves.toEqual({
      accessToken: 'jwt-de-prueba',
      tokenType: 'Bearer',
      expiresIn: 900,
    })
  })

  it('no trata credenciales incorrectas como sesión expirada', async () => {
    const manejador401 = vi.fn()

    establecerManejador401(manejador401)

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          timestamp: '2026-11-11T00:00:00Z',
          status: 401,
          error: 'Unauthorized',
          message: 'Credenciales inválidas',
          details: {},
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(
      iniciarSesionApi({
        identifier: 'incorrecto',
        password: 'incorrecta',
      }),
    ).rejects.toMatchObject({ status: 401 })

    expect(manejador401).not.toHaveBeenCalled()
  })

  it('valida el usuario autenticado y sus roles', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          username: 'admin_e2e',
          email: 'admin@pulsepass.test',
          roles: ['ADMIN'],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    establecerTokenHttp('jwt-de-prueba')

    await expect(
      obtenerUsuarioAutenticadoApi(),
    ).resolves.toMatchObject({
      id: 1,
      username: 'admin_e2e',
      roles: ['ADMIN'],
    })
  })
})