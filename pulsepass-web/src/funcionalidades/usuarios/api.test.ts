import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { obtenerUsuarioPorEmailApi } from './api'

describe('API de usuarios', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('obtiene el usuario por correo electrónico', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          username: 'andrea',
          email: 'andrea@pulsepass.test',
          active: true,
          firstName: 'Andrea',
          lastName: 'Ruiz',
          phone: null,
          city: 'Santa Marta',
          birthDate: '1998-04-12',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(
      obtenerUsuarioPorEmailApi('andrea@pulsepass.test'),
    ).resolves.toMatchObject({
      id: 1,
      username: 'andrea',
      firstName: 'Andrea',
      lastName: 'Ruiz',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users/by-email?email=andrea%40pulsepass.test',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    )
  })

  it('codifica el correo en la URL', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 2,
          username: 'correo_prueba',
          email: 'correo+prueba@pulsepass.test',
          active: true,
          firstName: 'Correo',
          lastName: 'Prueba',
          phone: null,
          city: null,
          birthDate: '2000-01-01',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await obtenerUsuarioPorEmailApi(
      'correo+prueba@pulsepass.test',
    )

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users/by-email?email=correo%2Bprueba%40pulsepass.test',
      expect.any(Object),
    )
  })

  it('rechaza un correo inválido antes de consultar', () => {
    expect(() =>
      obtenerUsuarioPorEmailApi('correo-invalido'),
    ).toThrow()

    expect(fetchMock).not.toHaveBeenCalled()
  })
})