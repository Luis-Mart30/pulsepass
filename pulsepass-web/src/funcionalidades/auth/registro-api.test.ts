import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { registrarUsuarioApi } from './api'

describe('API de registro de usuarios', () => {
  const fetchMock = vi.fn<typeof fetch>()

  const datosRegistro = {
    username: 'nuevo_usuario',
    email: 'nuevo@pulsepass.test',
    password: 'Contraseña123',
    firstName: 'Nuevo',
    lastName: 'Usuario',
    birthDate: '2000-05-20',
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('registra un usuario con los datos esperados', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 10,
          username: 'nuevo_usuario',
          email: 'nuevo@pulsepass.test',
          active: true,
          firstName: 'Nuevo',
          lastName: 'Usuario',
          phone: null,
          city: null,
          birthDate: '2000-05-20',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(
      registrarUsuarioApi(datosRegistro),
    ).resolves.toMatchObject({
      id: 10,
      username: 'nuevo_usuario',
      email: 'nuevo@pulsepass.test',
      active: true,
    })

    expect(fetchMock).toHaveBeenCalledOnce()

    const [ruta, opciones] = fetchMock.mock.calls[0] ?? []

    expect(ruta).toBe('/api/users')
    expect(opciones).toMatchObject({
      method: 'POST',
    })

    expect(JSON.parse(String(opciones?.body))).toEqual(
      datosRegistro,
    )
  })

  it('rechaza una contraseña corta antes de consultar la API', () => {
    expect(() =>
      registrarUsuarioApi({
        ...datosRegistro,
        password: 'corta',
      }),
    ).toThrow()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rechaza una fecha futura antes de consultar la API', () => {
    expect(() =>
      registrarUsuarioApi({
        ...datosRegistro,
        birthDate: '2999-01-01',
      }),
    ).toThrow()

    expect(fetchMock).not.toHaveBeenCalled()
  })
})