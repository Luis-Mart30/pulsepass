import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ApiError } from '../lib/http'
import {
  useSedePorCodigo,
  useSedesActivas,
} from '../funcionalidades/sedes/consultas'
import DetalleSede from './DetalleSede'
import ListaSedes from './ListaSedes'

vi.mock('../funcionalidades/sedes/consultas', () => ({
  useSedesActivas: vi.fn(),
  useSedePorCodigo: vi.fn(),
}))

const useSedesActivasMock = vi.mocked(useSedesActivas)
const useSedePorCodigoMock = vi.mocked(useSedePorCodigo)

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
      <MemoryRouter initialEntries={['/sedes']}>
        <ListaSedes />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function renderizarDetalle() {
  return render(
    <QueryClientProvider client={crearQueryClient()}>
      <MemoryRouter initialEntries={['/sedes/VEN-001']}>
        <Routes>
          <Route path="/sedes/:code" element={<DetalleSede />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('páginas públicas de sedes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra las sedes activas y enlaza al detalle', () => {
    useSedesActivasMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [
        {
          id: 1,
          code: 'VEN-001',
          name: 'Estadio PulsePass',
          city: 'Santa Marta',
          address: 'Carrera 1 # 10-20',
          capacity: 15000,
          active: true,
        },
      ],
    } as never)

    renderizarLista()

    expect(
      screen.getByRole('heading', {
        name: 'Estadio PulsePass',
      }),
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Ver sede' })).toHaveAttribute(
      'href',
      '/sedes/VEN-001',
    )

    expect(
      screen.getByText('15.000 personas', { exact: false }),
    ).toBeInTheDocument()
  })

  it('informa cuando no existen sedes activas', () => {
    useSedesActivasMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
    } as never)

    renderizarLista()

    expect(
      screen.getByText('No hay sedes activas disponibles en este momento.'),
    ).toBeInTheDocument()
  })

  it('muestra el estado de carga del listado', () => {
    useSedesActivasMock.mockReturnValue({
      isPending: true,
    } as never)

    renderizarLista()

    expect(screen.getByText('Cargando sedes…')).toBeInTheDocument()
  })

  it('muestra el detalle de una sede por código', () => {
    useSedePorCodigoMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: 1,
        code: 'VEN-001',
        name: 'Estadio PulsePass',
        city: 'Santa Marta',
        address: 'Carrera 1 # 10-20',
        capacity: 15000,
        active: true,
      },
    } as never)

    renderizarDetalle()

    expect(useSedePorCodigoMock).toHaveBeenCalledWith('VEN-001')

    expect(
      screen.getByRole('heading', {
        name: 'Estadio PulsePass',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('VEN-001')).toBeInTheDocument()
    expect(screen.getByText('Activa')).toBeInTheDocument()
  })

  it('diferencia una sede inexistente de un error general', () => {
    useSedePorCodigoMock.mockReturnValue({
      isPending: false,
      isError: true,
      error: new ApiError(404, 'Sede no encontrada'),
    } as never)

    renderizarDetalle()

    expect(
      screen.getByRole('heading', {
        name: 'Sede no encontrada',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Volver a sedes' }),
    ).toHaveAttribute('href', '/sedes')
  })
})
