import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Inicio from './Inicio'

const mocks = vi.hoisted(() => ({
  refetchArtistas: vi.fn(),
  refetchEventos: vi.fn(),
  useArtistasActivos: vi.fn(),
  useAuth: vi.fn(),
  useEventosPublicados: vi.fn(),
}))

vi.mock('../funcionalidades/artistas/consultas', () => ({
  useArtistasActivos: mocks.useArtistasActivos,
}))

vi.mock('../funcionalidades/auth/useAuth', () => ({
  useAuth: mocks.useAuth,
}))

vi.mock('../funcionalidades/eventos/consultas', () => ({
  useEventosPublicados: mocks.useEventosPublicados,
}))

const eventos = Array.from({ length: 4 }, (_, indice) => ({
  id: indice + 1,
  eventCode: `EVT-0${indice + 1}`,
  name: `Evento ${indice + 1}`,
  category: 'MUSIC' as const,
  status: 'PUBLISHED' as const,
  eventDate: `2026-12-${20 + indice}T19:00:00`,
  minimumAge: 0,
  venueCode: `VEN-0${indice + 1}`,
  venueName: `Sede ${indice + 1}`,
}))

const artistas = Array.from({ length: 7 }, (_, indice) => ({
  id: indice + 1,
  stageName: `Artista ${indice + 1}`,
  country: 'Colombia',
  genre: 'Pop',
  active: true,
}))

function renderizarInicio() {
  return render(
    <MemoryRouter>
      <Inicio />
    </MemoryRouter>,
  )
}

describe('página de Inicio', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.useAuth.mockReturnValue({
      sesion: { estado: 'anonimo' },
      iniciarSesion: vi.fn(),
      cerrarSesion: vi.fn(),
      tieneRol: () => false,
    })
    mocks.useEventosPublicados.mockReturnValue({
      isPending: false,
      isError: false,
      data: eventos,
      refetch: mocks.refetchEventos,
    })
    mocks.useArtistasActivos.mockReturnValue({
      isPending: false,
      isError: false,
      data: artistas,
      refetch: mocks.refetchArtistas,
    })
  })

  it('muestra las llamadas a la acción y limita los destacados', () => {
    renderizarInicio()

    expect(screen.getByRole('link', { name: 'Ver cartelera' })).toHaveAttribute(
      'href',
      '/eventos',
    )
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute(
      'href',
      '/registro',
    )

    expect(
      screen.getAllByRole('link', { name: /Ver evento Evento/ }),
    ).toHaveLength(3)
    expect(
      screen.queryByRole('link', {
        name: 'Ver evento Evento 4',
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /Ver artista Artista/ }),
    ).toHaveLength(6)
    expect(
      screen.queryByRole('link', {
        name: 'Ver artista Artista 7',
      }),
    ).not.toBeInTheDocument()
  })

  it('oculta Crear cuenta cuando existe una sesión', () => {
    mocks.useAuth.mockReturnValue({
      sesion: {
        estado: 'autenticado',
        token: 'token-prueba',
        expiraEn: 2_000_000_000_000,
        usuario: {
          id: 1,
          username: 'andrea',
          email: 'andrea@pulsepass.test',
          roles: ['USER'],
        },
      },
      iniciarSesion: vi.fn(),
      cerrarSesion: vi.fn(),
      tieneRol: () => true,
    })

    renderizarInicio()

    expect(
      screen.queryByRole('link', { name: 'Crear cuenta' }),
    ).not.toBeInTheDocument()
  })

  it('muestra esqueletos mientras carga el contenido', () => {
    mocks.useEventosPublicados.mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
      refetch: mocks.refetchEventos,
    })
    mocks.useArtistasActivos.mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
      refetch: mocks.refetchArtistas,
    })

    renderizarInicio()

    expect(
      screen.getAllByRole('status', {
        name: 'Cargando contenido',
      }),
    ).toHaveLength(2)
  })

  it('permite reintentar eventos y artistas después de un error', async () => {
    mocks.useEventosPublicados.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      refetch: mocks.refetchEventos,
    })
    mocks.useArtistasActivos.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      refetch: mocks.refetchArtistas,
    })
    renderizarInicio()
    const usuario = userEvent.setup()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Reintentar eventos',
      }),
    )
    await usuario.click(
      screen.getByRole('button', {
        name: 'Reintentar artistas',
      }),
    )

    expect(mocks.refetchEventos).toHaveBeenCalledOnce()
    expect(mocks.refetchArtistas).toHaveBeenCalledOnce()
  })

  it('muestra estados vacíos para eventos y artistas', () => {
    mocks.useEventosPublicados.mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
      refetch: mocks.refetchEventos,
    })
    mocks.useArtistasActivos.mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
      refetch: mocks.refetchArtistas,
    })

    renderizarInicio()

    expect(
      screen.getByText('Aún no hay eventos publicados.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Aún no hay artistas activos.')).toBeInTheDocument()
  })
})
