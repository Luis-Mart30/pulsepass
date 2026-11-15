import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Rol } from '../funcionalidades/auth/tipos'
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

function sesionAutenticada(roles: Rol[] = ['USER']) {
  vi.mocked(useAuth).mockReturnValue({
    sesion: {
      estado: 'autenticado',
      token: 'jwt-prueba',
      expiraEn: Date.now() + 60_000,
      usuario: {
        id: 1,
        username: 'usuario',
        email: 'usuario@pulsepass.test',
        roles,
      },
    },
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
    tieneRol: vi.fn((...solicitados: Rol[]) =>
      solicitados.some((rol) => roles.includes(rol)),
    ),
  })
}

function renderizarDetalleEvento() {
  return render(
    <MemoryRouter initialEntries={['/eventos/EVT-001']}>
      <Routes>
        <Route path="/eventos/:eventCode" element={<DetalleEvento />} />
        <Route path="/login" element={<p>Página de ingreso</p>} />
        <Route
          path="/compra/confirmacion/:ticketCode"
          element={<p>Destino de confirmación</p>}
        />
        <Route path="/403" element={<p>Sin permisos</p>} />
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

  it.each([403, 404])(
    'muestra Evento no disponible cuando la API responde %s',
    (estado) => {
      vi.mocked(useAuth).mockReturnValue({
        sesion: { estado: 'anonimo' },
        iniciarSesion: vi.fn(),
        cerrarSesion: vi.fn(),
        tieneRol: vi.fn(() => false),
      })
      vi.mocked(useEventoPorCodigo).mockReturnValue({
        isPending: false,
        isError: true,
        error: new ApiError(estado, 'Detalle interno del evento'),
      } as unknown as ReturnType<typeof useEventoPorCodigo>)

      renderizarDetalleEvento()

      expect(
        screen.getByRole('heading', { name: 'Evento no disponible' }),
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Detalle interno del evento'),
      ).not.toBeInTheDocument()
      expect(screen.queryByText('Festival del Caribe')).not.toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'Volver a eventos' }),
      ).toHaveAttribute('href', '/eventos')
    },
  )

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

    expect(screen.getByText('Página de ingreso')).toBeInTheDocument()
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it.each(['STAFF', 'ADMIN'] as const)(
    'muestra el detalle sin panel de compra para %s',
    (rol) => {
      sesionAutenticada([rol])
      renderizarDetalleEvento()

      expect(
        screen.getByRole('heading', { name: 'Festival del Caribe' }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('region', { name: 'Compra tu entrada' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Comprar entrada' }),
      ).not.toBeInTheDocument()
      expect(mutateAsync).not.toHaveBeenCalled()
    },
  )

  it('informa que un evento agotado no admite compras', () => {
    vi.mocked(useEventoPorCodigo).mockReturnValue({
      data: { ...evento, status: 'SOLD_OUT' },
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useEventoPorCodigo>)

    renderizarDetalleEvento()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Las entradas no están disponibles para este evento.',
    )
    expect(
      screen.queryByRole('button', { name: 'Comprar entrada' }),
    ).not.toBeInTheDocument()
  })

  it('compra el tipo seleccionado y navega a confirmación', async () => {
    const usuario = userEvent.setup()
    mutateAsync.mockResolvedValue(ticket)

    renderizarDetalleEvento()

    await usuario.click(screen.getByRole('radio', { name: /VIP/i }))
    await usuario.click(
      screen.getByRole('button', {
        name: 'Comprar entrada',
      }),
    )

    const modal = screen.getByRole('dialog', { name: 'Confirmar compra' })
    expect(modal).toHaveTextContent('Festival del Caribe')
    expect(modal).toHaveTextContent('VIP')
    expect(modal).toHaveTextContent('usuario@pulsepass.test')
    expect(mutateAsync).not.toHaveBeenCalled()
    await usuario.click(
      within(modal).getByRole('button', { name: 'Confirmar' }),
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

  it('permite cancelar la confirmación sin enviar la compra', async () => {
    const usuario = userEvent.setup()
    renderizarDetalleEvento()

    const botonComprar = screen.getByRole('button', { name: 'Comprar entrada' })
    await usuario.click(botonComprar)
    const modal = screen.getByRole('dialog', { name: 'Confirmar compra' })
    await usuario.click(within(modal).getByRole('button', { name: 'Cancelar' }))

    expect(modal).not.toBeInTheDocument()
    expect(botonComprar).toHaveFocus()
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('mantiene abierto el modal y muestra el motivo del conflicto', async () => {
    const usuario = userEvent.setup()

    mutateAsync.mockRejectedValue(
      new ApiError(409, 'El usuario no cumple la edad mínima.'),
    )

    renderizarDetalleEvento()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Comprar entrada',
      }),
    )

    const modal = screen.getByRole('dialog', { name: 'Confirmar compra' })
    await usuario.click(
      within(modal).getByRole('button', { name: 'Confirmar' }),
    )

    expect(await within(modal).findByRole('alert')).toHaveTextContent(
      'El usuario no cumple la edad mínima.',
    )
    expect(modal).toBeInTheDocument()
  })

  it('muestra el resumen de la compra confirmada', () => {
    render(
      <MemoryRouter initialEntries={['/compra/confirmacion/TKT-COMPRA-010']}>
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

    expect(screen.getByText('TKT-COMPRA-010')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Ver ticket' })).toHaveAttribute(
      'href',
      '/mis-tickets/TKT-COMPRA-010',
    )
  })
})
