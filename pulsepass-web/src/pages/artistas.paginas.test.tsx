import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useArtistaPorId,
  useArtistasActivos,
} from '../funcionalidades/artistas/consultas'
import { useEventosPorArtista } from '../funcionalidades/eventos/consultas'
import { ApiError } from '../lib/http'
import DetalleArtista from './DetalleArtista'
import ListaArtistas from './ListaArtistas'

vi.mock('../funcionalidades/artistas/consultas', () => ({
  useArtistasActivos: vi.fn(),
  useArtistaPorId: vi.fn(),
}))

vi.mock('../funcionalidades/eventos/consultas', () => ({
  useEventosPorArtista: vi.fn(),
}))

const useEventosPorArtistaMock = vi.mocked(useEventosPorArtista)
const artista = {
  id: 20,
  stageName: 'Mar Azul',
  country: 'Colombia',
  genre: 'Pop',
  active: true,
} as const

const useArtistasActivosMock = vi.mocked(useArtistasActivos)
const useArtistaPorIdMock = vi.mocked(useArtistaPorId)

function crearQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

function renderizarLista() {
  return render(
    <QueryClientProvider client={crearQueryClient()}>
      <MemoryRouter initialEntries={['/artistas']}>
        <Routes>
          <Route path="/artistas" element={<ListaArtistas />} />
          <Route path="/artistas/:id" element={<DetalleArtista />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function renderizarDetalle(ruta = '/artistas/20') {
  return render(
    <QueryClientProvider client={crearQueryClient()}>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/artistas/:id" element={<DetalleArtista />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('páginas públicas de artistas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useArtistaPorIdMock.mockReturnValue({ data: artista } as never)
    useEventosPorArtistaMock.mockReturnValue({
      isSuccess: true,
      data: [],
    } as never)
  })

  it('abre el detalle al pulsar el nombre dentro de la tarjeta', async () => {
    const usuario = userEvent.setup()
    useArtistasActivosMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [
        {
          id: 20,
          stageName: 'Mar Azul',
          country: 'Colombia',
          genre: 'Pop',
          active: true,
        },
      ],
    } as never)

    renderizarLista()

    const nombre = screen.getByRole('heading', { name: 'Mar Azul' })
    const tarjeta = screen.getByRole('link', { name: 'Ver artista Mar Azul' })
    expect(tarjeta).toHaveAttribute('href', '/artistas/20')
    expect(tarjeta).toContainElement(nombre)
    expect(tarjeta).toContainElement(screen.getByText('Colombia'))

    await usuario.click(nombre)

    expect(useArtistaPorIdMock).toHaveBeenCalledWith(20)
    expect(
      screen.getByRole('heading', { name: 'Próximos eventos de Mar Azul' }),
    ).toBeInTheDocument()
  })

  it('informa cuando no existen artistas activos', () => {
    useArtistasActivosMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
    } as never)

    renderizarLista()

    expect(
      screen.getByText('No hay artistas activos disponibles en este momento.'),
    ).toBeInTheDocument()
  })

  it('muestra el perfil y enlaza los eventos asociados al nombre artístico', () => {
    useEventosPorArtistaMock.mockReturnValue({
      isSuccess: true,
      data: [
        {
          id: 1,
          eventCode: 'MAR-2026',
          name: 'Festival del Mar',
          category: 'MUSIC',
          status: 'PUBLISHED',
          eventDate: '2026-12-20T19:00:00',
          minimumAge: 0,
          venueCode: 'VEN-01',
          venueName: 'Arena Central',
        },
      ],
    } as never)

    renderizarDetalle()

    expect(useArtistaPorIdMock).toHaveBeenCalledWith(20)
    expect(useEventosPorArtistaMock).toHaveBeenCalledWith('Mar Azul')
    expect(
      screen.getByRole('heading', { name: 'Próximos eventos de Mar Azul' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver evento Festival del Mar' }),
    ).toHaveAttribute('href', '/eventos/MAR-2026')

    expect(
      screen.getByRole('heading', { name: 'Mar Azul' }),
    ).toBeInTheDocument()

    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('Colombia')).toBeInTheDocument()
  })

  it('informa cuando el artista no tiene eventos publicados', () => {
    renderizarDetalle()

    expect(
      screen.getByText('Este artista aún no tiene eventos publicados.'),
    ).toBeInTheDocument()
  })

  it('muestra la carga de eventos con el perfil visible', () => {
    useEventosPorArtistaMock.mockReturnValue({ isPending: true } as never)

    renderizarDetalle()

    expect(
      screen.getByRole('heading', { name: 'Mar Azul' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando eventos…')
  })

  it('permite reintentar la consulta de eventos sin ocultar el perfil', async () => {
    const usuario = userEvent.setup()
    const refetch = vi.fn()
    useEventosPorArtistaMock.mockReturnValue({
      isError: true,
      refetch,
    } as never)

    renderizarDetalle()

    expect(
      screen.getByRole('heading', { name: 'Mar Azul' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No fue posible cargar los eventos del artista.',
    )
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('rechaza un identificador de ruta inválido', () => {
    useArtistaPorIdMock.mockReturnValue({
      isPending: true,
    } as never)

    renderizarDetalle('/artistas/abc')

    expect(useArtistaPorIdMock).toHaveBeenCalledWith(null)

    expect(
      screen.getByRole('heading', {
        name: 'Artista no encontrado',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('El identificador del artista no es válido.'),
    ).toBeInTheDocument()
  })

  it('muestra una respuesta específica cuando el artista no existe', () => {
    useArtistaPorIdMock.mockReturnValue({
      isPending: false,
      isError: true,
      error: new ApiError(404, 'Artista no encontrado'),
    } as never)

    renderizarDetalle()

    expect(
      screen.getByRole('heading', {
        name: 'Artista no encontrado',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'Volver a artistas',
      }),
    ).toHaveAttribute('href', '/artistas')
  })
})
