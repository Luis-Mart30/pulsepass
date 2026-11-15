import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useArtistaPorId,
  useArtistasActivos,
} from '../funcionalidades/artistas/consultas'
import { ApiError } from '../lib/http'
import DetalleArtista from './DetalleArtista'
import ListaArtistas from './ListaArtistas'

vi.mock('../funcionalidades/artistas/consultas', () => ({
  useArtistasActivos: vi.fn(),
  useArtistaPorId: vi.fn(),
}))

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
        <ListaArtistas />
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
  })

  it('muestra los artistas activos y enlaza al detalle', () => {
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

    expect(
      screen.getByRole('heading', { name: 'Mar Azul' }),
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Ver artista' })).toHaveAttribute(
      'href',
      '/artistas/20',
    )

    expect(screen.getByText('Colombia')).toBeInTheDocument()
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

  it('muestra el detalle del artista', () => {
    useArtistaPorIdMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: 20,
        stageName: 'Mar Azul',
        country: 'Colombia',
        genre: 'Pop',
        active: true,
      },
    } as never)

    renderizarDetalle()

    expect(useArtistaPorIdMock).toHaveBeenCalledWith(20)

    expect(
      screen.getByRole('heading', { name: 'Mar Azul' }),
    ).toBeInTheDocument()

    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('Colombia')).toBeInTheDocument()
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
