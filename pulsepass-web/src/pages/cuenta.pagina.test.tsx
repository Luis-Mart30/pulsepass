import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import Cuenta from './Cuenta'

const mocks = vi.hoisted(() => ({
  cerrarSesion: vi.fn(),
  refetchEmail: vi.fn(),
  refetchUsername: vi.fn(),
  useAuth: vi.fn(),
  useUsuarioPorEmail: vi.fn(),
  useUsuarioPorUsername: vi.fn(),
}))

vi.mock('../funcionalidades/auth/useAuth', () => ({
  useAuth: mocks.useAuth,
}))

vi.mock('../funcionalidades/usuarios/consultas', () => ({
  useUsuarioPorEmail: mocks.useUsuarioPorEmail,
  useUsuarioPorUsername: mocks.useUsuarioPorUsername,
}))

const sesionAutenticada = {
  estado: 'autenticado' as const,
  token: 'jwt-prueba',
  expiraEn: 2_000_000_000_000,
  usuario: {
    id: 1,
    username: 'andrea',
    email: 'andrea@pulsepass.test',
    roles: ['USER'] as const,
  },
}

const usuarioCompleto = {
  id: 1,
  username: 'andrea',
  email: 'andrea@pulsepass.test',
  active: true,
  firstName: 'Andrea',
  lastName: 'Ruiz',
  phone: null,
  city: 'Santa Marta',
  birthDate: '1998-04-12',
}

describe('página Mi cuenta', () => {
  beforeEach(() => {
    mocks.cerrarSesion.mockReset()
    mocks.refetchEmail.mockReset()
    mocks.refetchUsername.mockReset()
    mocks.useUsuarioPorEmail.mockReset()
    mocks.useUsuarioPorUsername.mockReset()

    mocks.useAuth.mockReturnValue({
      sesion: sesionAutenticada,
      iniciarSesion: vi.fn(),
      cerrarSesion: mocks.cerrarSesion,
      tieneRol: () => false,
    })
  })

  it('muestra el estado de carga', () => {
    mocks.useUsuarioPorEmail.mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
      refetch: mocks.refetchEmail,
    })
    mocks.useUsuarioPorUsername.mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
      refetch: mocks.refetchUsername,
    })

    render(
      <MemoryRouter>
        <Cuenta />
      </MemoryRouter>,
    )

    expect(
      screen.getByText('Cargando información de la cuenta…'),
    ).toBeInTheDocument()
  })

  it('muestra error y permite reintentar', async () => {
    mocks.useUsuarioPorEmail.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      refetch: mocks.refetchEmail,
    })
    mocks.useUsuarioPorUsername.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      refetch: mocks.refetchUsername,
    })

    render(
      <MemoryRouter>
        <Cuenta />
      </MemoryRouter>,
    )

    await userEvent.setup().click(
      screen.getByRole('button', { name: 'Reintentar' }),
    )

    expect(mocks.refetchEmail).toHaveBeenCalledOnce()
    expect(mocks.refetchUsername).toHaveBeenCalledOnce()
  })

  it('muestra el perfil y permite cerrar sesión', async () => {
    mocks.useUsuarioPorEmail.mockReturnValue({
      isPending: false,
      isError: false,
      data: usuarioCompleto,
      refetch: mocks.refetchEmail,
    })
    mocks.useUsuarioPorUsername.mockReturnValue({
      isPending: false,
      isError: false,
      data: usuarioCompleto,
      refetch: mocks.refetchUsername,
    })

    render(
      <MemoryRouter>
        <Cuenta />
      </MemoryRouter>,
    )

    expect(screen.getByText('Andrea Ruiz')).toBeInTheDocument()
    expect(
      screen.getByText('@andrea · andrea@pulsepass.test'),
    ).toBeInTheDocument()
    expect(screen.getByText('Rol')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver mis tickets' }),
    ).toHaveAttribute('href', '/mis-tickets')

    await userEvent.setup().click(
      screen.getByRole('button', {
        name: 'Cerrar sesión',
      }),
    )

    expect(mocks.cerrarSesion).toHaveBeenCalledOnce()
    expect(mocks.useUsuarioPorEmail).toHaveBeenCalledWith(
      'andrea@pulsepass.test',
    )
    expect(mocks.useUsuarioPorUsername).toHaveBeenCalledWith(
      'andrea',
    )
  })

  it('usa la consulta por username si falla la consulta por email', () => {
    mocks.useUsuarioPorEmail.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      refetch: mocks.refetchEmail,
    })
    mocks.useUsuarioPorUsername.mockReturnValue({
      isPending: false,
      isError: false,
      data: usuarioCompleto,
      refetch: mocks.refetchUsername,
    })

    render(
      <MemoryRouter>
        <Cuenta />
      </MemoryRouter>,
    )

    expect(screen.getByText('Andrea Ruiz')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'No fue posible cargar la información de la cuenta.',
      ),
    ).not.toBeInTheDocument()
  })
})
