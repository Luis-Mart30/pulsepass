import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { server } from '../test/server'
import AdminEventos from './AdminEventos'

const evento = {
  id: 1,
  eventCode: 'BORRADOR-01',
  name: 'Festival en preparación',
  description: 'Festival musical',
  category: 'MUSIC',
  status: 'DRAFT',
  eventDate: '2027-02-20T19:00:00',
  minimumAge: 18,
  venueCode: 'VEN-01',
  venueName: 'Arena Central',
  artists: [],
} as const

function renderizarPagina() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AdminEventos />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('página administrativa de eventos', () => {
  it('busca un evento por su código', async () => {
    server.use(
      http.get('/api/events/BORRADOR-01', () => HttpResponse.json(evento)),
    )
    const usuario = userEvent.setup()
    renderizarPagina()

    await usuario.type(
      screen.getByRole('searchbox', { name: 'Código del evento' }),
      'BORRADOR-01',
    )
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(
      await screen.findByText('Festival en preparación'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Gestionar evento' }),
    ).toHaveAttribute('href', '/admin/eventos/BORRADOR-01')
  })

  it('valida el código obligatorio sin consultar la API', async () => {
    const usuario = userEvent.setup()
    renderizarPagina()

    await usuario.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(
      await screen.findByText('Ingresa el código del evento.'),
    ).toBeInTheDocument()
  })

  it('diferencia un evento inexistente de un error general', async () => {
    server.use(
      http.get('/api/events/NO-EXISTE', () =>
        HttpResponse.json(
          {
            timestamp: '2026-11-15T00:00:00Z',
            status: 404,
            error: 'Not Found',
            message: 'Event not found',
            details: {},
          },
          { status: 404 },
        ),
      ),
    )
    const usuario = userEvent.setup()
    renderizarPagina()

    await usuario.type(
      screen.getByRole('searchbox', { name: 'Código del evento' }),
      'NO-EXISTE',
    )
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByText('Evento no encontrado')).toBeInTheDocument()
  })

  it('mantiene disponible la creación de eventos', () => {
    renderizarPagina()

    expect(screen.getByRole('link', { name: 'Crear evento' })).toHaveAttribute(
      'href',
      '/admin/eventos/nuevo',
    )
  })
})
