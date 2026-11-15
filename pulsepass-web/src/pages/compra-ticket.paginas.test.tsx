import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { useAuth } from '../funcionalidades/auth/useAuth'
import { useEventoPorCodigo } from '../funcionalidades/eventos/consultas'
import type { Evento } from '../funcionalidades/eventos/tipos'
import {
  useComprarTicket,
  useTicket,
} from '../funcionalidades/tickets/consultas'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import ConfirmacionCompra from './ConfirmacionCompra'
import DetalleEvento from './DetalleEvento'

vi.mock('../funcionalidades/auth/useAuth')
vi.mock('../funcionalidades/eventos/consultas')
vi.mock('../funcionalidades/tickets/consultas')

const evento: Evento = {
  id: 1,
  eventCode: 'EVT-001',
  name: 'Festival del Caribe',
  description: 'Una celebración musical.',
  category: 'MUSIC',
  status: 'PUBLISHED',
  eventDate: '2026-12-20T20:00:00',
  minimumAge: 18,
  venueCode: 'VEN-001',
  venueName: 'Estadio del Mar',
  artists: [],
}

const ticket: Ticket = {
  id: 10,
  ticketCode: 'TKT-COMPRA-010',
  type: 'VIP',
  price: 180000,
  status: 'PAID',
  purchaseDate: '2026-11-15T20:10:00',
  userEmail: 'usuario@pulsepass.test',
  eventCode: 'EVT-001',
  eventName: 'Festival del Caribe',
}

const mutateAsync = vi.fn()

function sesionAutenticada() {
  vi.mocked(useAuth).mockReturnValue({
    sesion: {
      estado: 'autenticado',
      token: 'jwt-prueba',
      expiraEn: Date.now() + 60_000,
      usuario: {
        id: 1,
        username: 'usuario',
        email: 'usuario@pulsepass.test',
        roles: ['USER'],
      },
    },
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
    tieneRol: vi.fn(() => true),
  })
}

function renderizarDetalleEvento() {
  return render(
    <MemoryRouter initialEntries={['/eventos/EVT-001']}>
      <Routes>
        <Route
          path="/eventos/:eventCode"
          element={<DetalleEvento />}
        />
        <Route
          path="/login"
          element={<p>Página de ingreso</p>}
        />
        <Route
          path="/compra/confirmacion/:ticketCode"
          element={<p>Destino de confirmación</p>}
        />
        <Route
          path="/403"
          element={<p>Sin permisos</p>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('flujo de compra de tickets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sesionAutenticada()

    vi.mocked(useEventoPorCodigo).mockReturnValue({
      data: evento,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useEventoPorCodigo>)

    vi.mocked(useComprarTicket).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useComprarTicket>)

    vi.mocked(useTicket).mockReturnValue({
      data: ticket,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTicket>)
  })

  it('envía al anónimo al login antes de comprar', async () => {
    const usuario = userEvent.setup()

    vi.mocked(useAuth).mockReturnValue({
      sesion: { estado: 'anonimo' },
      iniciarSesion: vi.fn(),
      cerrarSesion: vi.fn(),
      tieneRol: vi.fn(() => false),
    })

    renderizarDetalleEvento()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión para comprar',
      }),
    )

    expect(
      screen.getByText('Página de ingreso'),
    ).toBeInTheDocument()
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('compra el tipo seleccionado y navega a confirmación', async () => {
    const usuario = userEvent.setup()
    mutateAsync.mockResolvedValue(ticket)

    renderizarDetalleEvento()

    await usuario.click(
      screen.getByRole('radio', { name: /VIP/i }),
    )
    await usuario.click(
      screen.getByRole('button', {
        name: 'Comprar entrada',
      }),
    )

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        userEmail: 'usuario@pulsepass.test',
        eventCode: 'EVT-001',
        type: 'VIP',
      })
    })

    expect(
      await screen.findByText('Destino de confirmación'),
    ).toBeInTheDocument()
  })

  it('muestra el conflicto de disponibilidad dentro de la página', async () => {
    const usuario = userEvent.setup()

    mutateAsync.mockRejectedValue(
      new ApiError(409, 'Sin disponibilidad'),
    )

    renderizarDetalleEvento()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Comprar entrada',
      }),
    )

    expect(
      await screen.findByText(
        /la disponibilidad del evento cambió/i,
      ),
    ).toBeInTheDocument()
  })

  it('muestra el resumen de la compra confirmada', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/compra/confirmacion/TKT-COMPRA-010',
        ]}
      >
        <Routes>
          <Route
            path="/compra/confirmacion/:ticketCode"
            element={<ConfirmacionCompra />}
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: '¡Compra confirmada!',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('TKT-COMPRA-010'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Ver ticket' }),
    ).toHaveAttribute(
      'href',
      '/mis-tickets/TKT-COMPRA-010',
    )
  })
})