import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useArtistaPorNombre,
  useArtistasActivos,
} from '../funcionalidades/artistas/consultas'
import {
  useEventosPorArtista,
  useEventosPublicados,
} from '../funcionalidades/eventos/consultas'
import CatalogoEventos from './CatalogoEventos'

vi.mock('../funcionalidades/artistas/consultas', () => ({
  useArtistaPorNombre: vi.fn(),
  useArtistasActivos: vi.fn(),
}))

vi.mock('../funcionalidades/eventos/consultas', () => ({
  useEventosPublicados: vi.fn(),
  useEventosPorArtista: vi.fn(),
}))

const useArtistaPorNombreMock = vi.mocked(useArtistaPorNombre)
const useArtistasActivosMock = vi.mocked(useArtistasActivos)
const useEventosPublicadosMock = vi.mocked(useEventosPublicados)
const useEventosPorArtistaMock = vi.mocked(useEventosPorArtista)

const eventos = [
  {
    id: 1,
    eventCode: 'CMF-2026',
    name: 'Caribbean Music Fest',
    category: 'MUSIC',
    status: 'PUBLISHED',
    eventDate: '2026-12-20T19:00:00',
    minimumAge: 18,
    venueCode: 'VEN-01',
    venueName: 'Arena Central',
  },
  {
    id: 2,
    eventCode: 'TECH-2026',
    name: 'Tech Summit',
    category: 'TECHNOLOGY',
    status: 'PUBLISHED',
    eventDate: '2026-12-22T09:00:00',
    minimumAge: 0,
    venueCode: 'VEN-02',
    venueName: 'Centro Digital',
  },
] as const

function UbicacionActual() {
  const location = useLocation()

  return <output data-testid="ubicacion">{location.search}</output>
}

function renderizarCatalogo(ruta = '/eventos') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <CatalogoEventos />
      <UbicacionActual />
    </MemoryRouter>,
  )
}

describe('página Catálogo de eventos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useArtistaPorNombreMock.mockReturnValue({ data: undefined } as never)

    useArtistasActivosMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [
        {
          id: 20,
          stageName: 'Solar Beat',
          country: 'Colombia',
          genre: 'Electronic',
          active: true,
        },
      ],
    } as never)
    useEventosPublicadosMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: eventos,
      refetch: vi.fn(),
    } as never)
    useEventosPorArtistaMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
      refetch: vi.fn(),
    } as never)
  })

  it('lista eventos publicados y hace navegable la tarjeta completa', () => {
    renderizarCatalogo()

    expect(screen.getByText('2 eventos')).toBeInTheDocument()
    expect(screen.getAllByText('PUBLISHED')).toHaveLength(2)
    expect(
      screen.getByRole('link', {
        name: 'Ver evento Caribbean Music Fest',
      }),
    ).toHaveAttribute('href', '/eventos/CMF-2026')
    expect(
      screen.getByRole('link', {
        name: 'Ver evento Tech Summit',
      }),
    ).toHaveAttribute('href', '/eventos/TECH-2026')
  })

  it('muestra el estado vacío de la cartelera', () => {
    useEventosPublicadosMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
      refetch: vi.fn(),
    } as never)

    renderizarCatalogo()

    expect(
      screen.getByText('Aún no hay eventos publicados.'),
    ).toBeInTheDocument()
  })

  it('restaura los filtros y actualiza texto y categoría en la URL', async () => {
    const usuario = userEvent.setup()
    renderizarCatalogo('/eventos?q=caribbean&categoria=MUSIC')

    expect(
      screen.getByRole('link', {
        name: 'Ver evento Caribbean Music Fest',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', {
        name: 'Ver evento Tech Summit',
      }),
    ).not.toBeInTheDocument()

    const buscador = screen.getByRole('searchbox', {
      name: 'Buscar por nombre',
    })
    await usuario.clear(buscador)
    await usuario.type(buscador, 'tech')
    await usuario.selectOptions(
      screen.getByRole('combobox', { name: 'Categoría' }),
      'TECHNOLOGY',
    )

    expect(
      screen.getByRole('link', {
        name: 'Ver evento Tech Summit',
      }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('q=tech')
    expect(screen.getByTestId('ubicacion')).toHaveTextContent(
      'categoria=TECHNOLOGY',
    )
  })

  it('consulta el perfil y los eventos del artista indicado en la URL', () => {
    useArtistaPorNombreMock.mockReturnValue({
      data: {
        id: 20,
        stageName: 'Solar Beat',
        country: 'Colombia',
        genre: 'Electronic',
        active: true,
      },
    } as never)
    useEventosPorArtistaMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [eventos[0]],
      refetch: vi.fn(),
    } as never)

    renderizarCatalogo('/eventos?artista=Solar+Beat')

    expect(useEventosPublicadosMock).toHaveBeenCalledWith(false)
    expect(useEventosPorArtistaMock).toHaveBeenCalledWith('Solar Beat')
    expect(useArtistaPorNombreMock).toHaveBeenCalledWith('Solar Beat')
    expect(
      screen.getByRole('link', { name: 'Ver perfil de Solar Beat' }),
    ).toHaveAttribute('href', '/artistas/20')
    expect(
      screen.getByRole('link', {
        name: 'Ver evento Caribbean Music Fest',
      }),
    ).toBeInTheDocument()
  })

  it('ignora una categoría inválida recibida desde la URL', () => {
    renderizarCatalogo('/eventos?categoria=INVALIDA')

    expect(screen.getByText('2 eventos')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveValue('')
  })
})
