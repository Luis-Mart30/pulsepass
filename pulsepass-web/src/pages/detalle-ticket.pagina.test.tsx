import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../funcionalidades/auth/useAuth'
import {
  useCancelarTicket,
  useTicket,
} from '../funcionalidades/tickets/consultas'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import DetalleTicket from './DetalleTicket'

vi.mock('../funcionalidades/auth/useAuth')
vi.mock('../funcionalidades/tickets/consultas')

const ticket: Ticket = {
  id: 1,
  ticketCode: 'TKT-PAID-001',
  type: 'VIP',
  price: 180000,
  status: 'PAID',
  purchaseDate: '2026-11-10T18:30:00',
  userEmail: 'usuario@pulsepass.test',
  eventCode: 'EVT-001',
  eventName: 'Festival del Caribe',
}

const refetch = vi.fn()
const mutateAsync = vi.fn()

function renderizarDetalle() {
  return render(
    <MemoryRouter initialEntries={['/mis-tickets/TKT-PAID-001']}>
      <Routes>
        <Route path="/mis-tickets/:ticketCode" element={<DetalleTicket />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('página Detalle del ticket', () => {
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

    vi.mocked(useTicket).mockReturnValue({
      data: ticket,
      isPending: false,
      isError: false,
      refetch,
    } as unknown as ReturnType<typeof useTicket>)

    vi.mocked(useCancelarTicket).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCancelarTicket>)
  })

  it('muestra la información completa del ticket', () => {
    renderizarDetalle()

    expect(
      screen.getByRole('heading', {
        name: 'Festival del Caribe',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('TKT-PAID-001')).toBeInTheDocument()

    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.getByText('Pagado')).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'Ver detalles del evento',
      }),
    ).toHaveAttribute('href', '/eventos/EVT-001')

    expect(
      screen.getByRole('button', {
        name: 'Copiar código',
      }),
    ).toBeInTheDocument()
  })

  it('protege la existencia del ticket con un error genérico', () => {
    vi.mocked(useTicket).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch,
    } as unknown as ReturnType<typeof useTicket>)

    renderizarDetalle()

    expect(
      screen.getByRole('heading', {
        name: 'Ticket no disponible',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/no pudimos encontrar este ticket o no tienes permiso/i),
    ).toBeInTheDocument()
  })

  it('permite confirmar la cancelación del ticket', async () => {
    const usuario = userEvent.setup()

    mutateAsync.mockResolvedValue({
      ...ticket,
      status: 'CANCELLED',
    })

    renderizarDetalle()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Cancelar ticket',
      }),
    )

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

  it('muestra el motivo del 409 dentro del modal de cancelación', async () => {
    const usuario = userEvent.setup()
    const motivo = 'Only PAID tickets can be cancelled.'
    mutateAsync.mockRejectedValue(new ApiError(409, motivo))

    renderizarDetalle()
    await usuario.click(screen.getByRole('button', { name: 'Cancelar ticket' }))
    const modal = screen.getByRole('dialog', { name: 'Cancelar ticket' })
    await usuario.click(
      within(modal).getByRole('button', { name: 'Confirmar cancelación' }),
    )

    expect(await within(modal).findByText(motivo)).toBeInTheDocument()
  })
})
