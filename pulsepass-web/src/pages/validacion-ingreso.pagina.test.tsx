import {
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  useMarcarTicketUsado,
  useTicket,
} from '../funcionalidades/tickets/consultas'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import ValidacionIngreso from './ValidacionIngreso'

vi.mock('../funcionalidades/tickets/consultas')

const ticketPagado: Ticket = {
  id: 1,
  ticketCode: 'TKT-STAFF-001',
  type: 'GENERAL',
  price: 90000,
  status: 'PAID',
  purchaseDate: '2026-11-15T19:00:00',
  userEmail: 'titular@pulsepass.test',
  eventCode: 'EVT-001',
  eventName: 'Festival del Caribe',
}

const mutateAsync = vi.fn()
const reset = vi.fn()

function configurarTicket(ticket: Ticket) {
  vi.mocked(useTicket).mockImplementation((codigo) => ({
    data: codigo.length > 0 ? ticket : undefined,
    isPending: false,
    isError: false,
    error: null,
  }) as unknown as ReturnType<typeof useTicket>)
}

async function buscarCodigo() {
  const usuario = userEvent.setup()

  await usuario.type(
    screen.getByLabelText('Código del ticket'),
    'TKT-STAFF-001',
  )
  await usuario.click(
    screen.getByRole('button', {
      name: 'Buscar ticket',
    }),
  )

  return usuario
}

describe('página de validación de ingreso', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    configurarTicket(ticketPagado)

    vi.mocked(useMarcarTicketUsado).mockReturnValue({
      mutateAsync,
      isPending: false,
      reset,
    } as unknown as ReturnType<
      typeof useMarcarTicketUsado
    >)
  })

  it('muestra un ticket pagado como entrada válida', async () => {
    render(<ValidacionIngreso />)

    await buscarCodigo()

    expect(
      screen.getByRole('heading', {
        name: 'Entrada válida',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Marcar como usado',
      }),
    ).toBeInTheDocument()
  })

  it('rechaza un ticket que ya fue utilizado', async () => {
    configurarTicket({
      ...ticketPagado,
      status: 'USED',
    })

    render(<ValidacionIngreso />)

    await buscarCodigo()

    expect(
      screen.getByRole('heading', {
        name: 'Entrada ya utilizada',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Este ticket ya fue utilizado anteriormente.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('button', {
        name: 'Marcar como usado',
      }),
    ).not.toBeInTheDocument()
  })

  it('rechaza un ticket cancelado', async () => {
    configurarTicket({
      ...ticketPagado,
      status: 'CANCELLED',
    })

    render(<ValidacionIngreso />)

    await buscarCodigo()

    expect(
      screen.getByRole('heading', {
        name: 'Entrada cancelada',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/no permitas el ingreso/i),
    ).toBeInTheDocument()
  })

  it('muestra ticket no encontrado para una respuesta 404', async () => {
    vi.mocked(useTicket).mockImplementation((codigo) => ({
      data: undefined,
      isPending: false,
      isError: codigo.length > 0,
      error:
        codigo.length > 0
          ? new ApiError(404, 'No encontrado')
          : null,
    }) as unknown as ReturnType<typeof useTicket>)

    render(<ValidacionIngreso />)

    await buscarCodigo()

    expect(
      screen.getByRole('heading', {
        name: 'Ticket no encontrado',
      }),
    ).toBeInTheDocument()
  })

  it('marca correctamente el ticket como usado', async () => {
    const ticketUsado: Ticket = {
      ...ticketPagado,
      status: 'USED',
    }

    mutateAsync.mockResolvedValue(ticketUsado)

    render(<ValidacionIngreso />)

    const usuario = await buscarCodigo()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Marcar como usado',
      }),
    )

    expect(mutateAsync).toHaveBeenCalledWith(
      'TKT-STAFF-001',
    )

    expect(
      await screen.findByText(
        'Ingreso validado correctamente.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Entrada ya utilizada',
      }),
    ).toBeInTheDocument()
  })

  it('muestra el conflicto si el estado cambió al validar', async () => {
    mutateAsync.mockRejectedValue(
      new ApiError(409, 'El ticket ya fue usado'),
    )

    render(<ValidacionIngreso />)

    const usuario = await buscarCodigo()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Marcar como usado',
      }),
    )

    expect(
      await screen.findByText(
        /el ticket ya fue utilizado o su estado cambió/i,
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Marcar como usado',
      }),
    ).toBeInTheDocument()
  })
})