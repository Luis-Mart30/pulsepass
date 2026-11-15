import { MemoryRouter } from 'react-router'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useCancelarTicket,
  useMisTickets,
} from '../funcionalidades/tickets/consultas'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import { useAuth } from '../funcionalidades/auth/useAuth'
import { ApiError } from '../lib/http'
import MisTickets from './MisTickets'

vi.mock('../funcionalidades/auth/useAuth')
vi.mock('../funcionalidades/tickets/consultas')

const tickets: Ticket[] = [
  {
    id: 1,
    ticketCode: 'TKT-PAID-001',
    type: 'VIP',
    price: 180000,
    status: 'PAID',
    purchaseDate: '2026-11-10T18:30:00',
    userEmail: 'usuario@pulsepass.test',
    eventCode: 'EVT-001',
    eventName: 'Festival del Caribe',
  },
  {
    id: 2,
    ticketCode: 'TKT-USED-002',
    type: 'GENERAL',
    price: 80000,
    status: 'USED',
    purchaseDate: '2026-10-05T14:00:00',
    userEmail: 'usuario@pulsepass.test',
    eventCode: 'EVT-002',
    eventName: 'Concierto del Mar',
  },
  {
    id: 3,
    ticketCode: 'TKT-CANCELLED-003',
    type: 'STUDENT',
    price: 45000,
    status: 'CANCELLED',
    purchaseDate: '2026-09-01T09:00:00',
    userEmail: 'usuario@pulsepass.test',
    eventCode: 'EVT-003',
    eventName: 'Encuentro Tecnológico',
  },
]

const refetch = vi.fn()
const mutateAsync = vi.fn()

function configurarConsulta(datos: Ticket[]) {
  vi.mocked(useMisTickets).mockReturnValue({
    data: datos,
    isPending: false,
    isError: false,
    refetch,
  } as unknown as ReturnType<typeof useMisTickets>)
}

function renderizarPagina() {
  return render(
    <MemoryRouter>
      <MisTickets />
    </MemoryRouter>,
  )
}

describe('página Mis tickets', () => {
  beforeEach(() => {
    vi.clearAllMocks()

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
      tieneRol: vi.fn(),
    })

    configurarConsulta(tickets)

    vi.mocked(useCancelarTicket).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCancelarTicket>)
  })

  it('muestra los tickets y permite filtrarlos', async () => {
    const usuario = userEvent.setup()

    renderizarPagina()

    expect(screen.getByText('Festival del Caribe')).toBeInTheDocument()
    expect(screen.getByText('Concierto del Mar')).toBeInTheDocument()
    expect(screen.getByText('Encuentro Tecnológico')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Usados' }))

    expect(screen.getByText('Concierto del Mar')).toBeInTheDocument()
    expect(screen.queryByText('Festival del Caribe')).not.toBeInTheDocument()
    expect(screen.queryByText('Encuentro Tecnológico')).not.toBeInTheDocument()
  })

  it('muestra el estado vacío con acceso al catálogo', () => {
    configurarConsulta([])

    renderizarPagina()

    expect(screen.getByText('Aún no tienes tickets')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver eventos' })).toHaveAttribute(
      'href',
      '/eventos',
    )
  })

  it('confirma la cancelación de un ticket pagado', async () => {
    const usuario = userEvent.setup()
    mutateAsync.mockResolvedValue({
      ...tickets[0],
      status: 'CANCELLED',
    })

    renderizarPagina()

    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(
      screen.getByRole('dialog', {
        name: 'Cancelar ticket',
      }),
    ).toBeInTheDocument()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Confirmar cancelación',
      }),
    )

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('TKT-PAID-001')
    })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('mantiene el modal abierto cuando la API responde 409', async () => {
    mutateAsync.mockRejectedValue(
      new ApiError(409, 'El ticket no puede cancelarse'),
    )

    renderizarPagina()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Confirmar cancelación',
      }),
    )

    expect(
      await screen.findByText(/este ticket ya no puede cancelarse/i),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('dialog', {
        name: 'Cancelar ticket',
      }),
    ).toBeInTheDocument()
  })
})
