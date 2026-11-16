import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { queryClient } from '../../lib/query-client'
import { borrarSesion } from './almacenamiento'
import { iniciarSesionApi, obtenerUsuarioAutenticadoApi } from './api'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

vi.mock('./api', () => ({
  iniciarSesionApi: vi.fn(),
  obtenerUsuarioAutenticadoApi: vi.fn(),
}))

const iniciarSesionMock = vi.mocked(iniciarSesionApi)
const obtenerUsuarioMock = vi.mocked(obtenerUsuarioAutenticadoApi)

function ObservadorSesion() {
  const { sesion, iniciarSesion, cerrarSesion, tieneRol } = useAuth()

  return (
    <>
      <p>{sesion.estado}</p>
      <p>{tieneRol('ADMIN') ? 'es-admin' : 'sin-admin'}</p>
      <button
        type="button"
        onClick={() => {
          void iniciarSesion({
            identifier: 'admin_e2e',
            password: 'contraseña-de-prueba',
          })
        }}
      >
        Iniciar prueba
      </button>
      <button type="button" onClick={cerrarSesion}>
        Cerrar prueba
      </button>
    </>
  )
}

function renderizarProvider() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ObservadorSesion />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    borrarSesion()
    queryClient.clear()
    vi.clearAllMocks()
  })

  it('inicia como anónimo cuando no existe sesión', async () => {
    renderizarProvider()

    expect(await screen.findByText('anonimo')).toBeInTheDocument()
    expect(screen.getByText('sin-admin')).toBeInTheDocument()
  })

  it('inicia sesión y obtiene los roles desde /auth/me', async () => {
    iniciarSesionMock.mockResolvedValue({
      accessToken: 'jwt-de-prueba',
      tokenType: 'Bearer',
      expiresIn: 900,
    })

    obtenerUsuarioMock.mockResolvedValue({
      id: 1,
      username: 'admin_e2e',
      email: 'admin@pulsepass.test',
      roles: ['ADMIN'],
    })

    const usuario = userEvent.setup()

    renderizarProvider()

    await screen.findByText('anonimo')
    await usuario.click(
      screen.getByRole('button', {
        name: 'Iniciar prueba',
      }),
    )

    expect(await screen.findByText('autenticado')).toBeInTheDocument()
    expect(screen.getByText('es-admin')).toBeInTheDocument()
    expect(sessionStorage.getItem('pulsepass.sesion')).not.toBeNull()
  })

  it('cierra la sesión y limpia el almacenamiento', async () => {
    iniciarSesionMock.mockResolvedValue({
      accessToken: 'jwt-de-prueba',
      tokenType: 'Bearer',
      expiresIn: 900,
    })

    obtenerUsuarioMock.mockResolvedValue({
      id: 1,
      username: 'user_e2e',
      email: 'user@pulsepass.test',
      roles: ['USER'],
    })

    const usuario = userEvent.setup()

    renderizarProvider()

    await screen.findByText('anonimo')
    await usuario.click(
      screen.getByRole('button', {
        name: 'Iniciar prueba',
      }),
    )
    await screen.findByText('autenticado')

    await usuario.click(
      screen.getByRole('button', {
        name: 'Cerrar prueba',
      }),
    )

    await waitFor(() => {
      expect(screen.getByText('anonimo')).toBeInTheDocument()
    })

    expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  })
})
