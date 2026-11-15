import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useMarcarTicketUsado,
  useTicketsPagados,
} from '../funcionalidades/tickets/consultas'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import TicketsPagadosEvento from './TicketsPagadosEvento'

vi.mock('../funcionalidades/tickets/consultas')

const tickets: Ticket[] = [
  {
    id: 1,
    ticketCode: 'TKT-PAID-001',
    type: 'GENERAL',
    price: 90000,
    status: 'PAID',
    purchaseDate: '2026-11-15T19:00:00',
    userEmail: 'uno@pulsepass.test',
    eventCode: 'EVT-001',
    eventName: 'Festival del Caribe',
  },
  {
    id: 2,
    ticketCode: 'TKT-PAID-002',
    type: 'VIP',
    price: 180000,
    status: 'PAID',
    purchaseDate: '2026-11-15T19:30:00',
    userEmail: 'dos@pulsepass.test',
    eventCode: 'EVT-001',
    eventName: 'Festival del Caribe',
  },
]

const refetch = vi.fn()
const mutateAsync = vi.fn()

function configurarConsulta(datos: Ticket[]) {
  vi.mocked(useTicketsPagados).mockReturnValue({
    data: datos,
    isPending: false,
    isError: false,
    refetch,
  } as unknown as ReturnType<typeof useTicketsPagados>)
}

function renderizarPagina() {
  return render(
    <MemoryRouter initialEntries={['/staff/eventos/EVT-001/tickets']}>
      <Routes>
        <Route
          path="/staff/eventos/:eventCode/tickets"
          element={<TicketsPagadosEvento />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('tickets pagados de un evento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    configurarConsulta(tickets)

    vi.mocked(useMarcarTicketUsado).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useMarcarTicketUsado>)
  })

  it('muestra los tickets pagados pendientes', () => {
    renderizarPagina()

    expect(screen.getByText('Festival del Caribe')).toBeInTheDocument()

    expect(screen.getByText('TKT-PAID-001')).toBeInTheDocument()
    expect(screen.getByText('TKT-PAID-002')).toBeInTheDocument()

    expect(screen.getByText('Pendientes de validación: 2')).toBeInTheDocument()
  })

  it('muestra el estado vacío', () => {
    configurarConsulta([])

    renderizarPagina()

    expect(
      screen.getByRole('heading', {
        name: 'No hay tickets pagados pendientes',
      }),
    ).toBeInTheDocument()
  })

  it('permite reintentar cuando falla la consulta', async () => {
    const usuario = userEvent.setup()

    vi.mocked(useTicketsPagados).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch,
    } as unknown as ReturnType<typeof useTicketsPagados>)

    renderizarPagina()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Reintentar',
      }),
    )

    expect(refetch).toHaveBeenCalled()
  })

  it('valida y retira el ticket de los pendientes', async () => {
    const usuario = userEvent.setup()

    mutateAsync.mockResolvedValue({
      ...tickets[0],
      status: 'USED',
    })

    renderizarPagina()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Validar ingreso de TKT-PAID-001',
      }),
    )

    expect(mutateAsync).toHaveBeenCalledWith('TKT-PAID-001')

    expect(
      await screen.findByText('Ticket TKT-PAID-001 validado correctamente.'),
    ).toBeInTheDocument()

    expect(screen.queryByText('TKT-PAID-001')).not.toBeInTheDocument()

    expect(screen.getByText('Pendientes de validación: 1')).toBeInTheDocument()
  })

  it('conserva el ticket cuando la validación responde 409', async () => {
    const usuario = userEvent.setup()

    mutateAsync.mockRejectedValue(new ApiError(409, 'El estado cambió'))

    renderizarPagina()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Validar ingreso de TKT-PAID-001',
      }),
    )

    expect(
      await screen.findByText(/el ticket ya fue utilizado o su estado cambió/i),
    ).toBeInTheDocument()

    expect(screen.getByText('TKT-PAID-001')).toBeInTheDocument()
  })
})
