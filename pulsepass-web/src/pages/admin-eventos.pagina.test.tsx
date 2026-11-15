import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { server } from '../test/server'
import AdminEventos from './AdminEventos'

const eventos = [
  {
    id: 1,
    eventCode: 'BORRADOR-01',
    name: 'Festival en preparación',
    category: 'MUSIC',
    status: 'DRAFT',
    eventDate: '2027-02-20T19:00:00',
    minimumAge: 18,
    venueCode: 'VEN-01',
    venueName: 'Arena Central',
  },
  {
    id: 2,
    eventCode: 'PUBLICADO-01',
    name: 'Concierto publicado',
    category: 'ENTERTAINMENT',
    status: 'PUBLISHED',
    eventDate: '2027-03-10T20:00:00',
    minimumAge: 12,
    venueCode: 'VEN-02',
    venueName: 'Teatro del Mar',
  },
] as const

function renderizarPagina() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
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
  it('muestra todos los eventos y su resumen', async () => {
    server.use(
      http.get('/api/events', () => HttpResponse.json(eventos)),
    )

    renderizarPagina()

    expect(
      await screen.findByText('Festival en preparación'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Concierto publicado'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Crear evento' }),
    ).toHaveAttribute('href', '/admin/eventos/nuevo')
  })

  it('filtra los eventos por estado', async () => {
    server.use(
      http.get('/api/events', () => HttpResponse.json(eventos)),
    )

    const usuario = userEvent.setup()
    renderizarPagina()

    await screen.findByText('Festival en preparación')
    await usuario.selectOptions(
      screen.getByRole('combobox', { name: 'Estado' }),
      'PUBLISHED',
    )

    expect(
      screen.queryByText('Festival en preparación'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Concierto publicado'),
    ).toBeInTheDocument()
  })

  it('busca por nombre, código o sede', async () => {
    server.use(
      http.get('/api/events', () => HttpResponse.json(eventos)),
    )

    const usuario = userEvent.setup()
    renderizarPagina()

    await screen.findByText('Festival en preparación')
    await usuario.type(
      screen.getByRole('searchbox', {
        name: 'Buscar eventos',
      }),
      'Teatro del Mar',
    )

    expect(
      screen.queryByText('Festival en preparación'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Concierto publicado'),
    ).toBeInTheDocument()
  })

  it('muestra el estado vacío', async () => {
    server.use(
      http.get('/api/events', () => HttpResponse.json([])),
    )

    renderizarPagina()

    expect(
      await screen.findByText(
        'No hay eventos que coincidan con los filtros.',
      ),
    ).toBeInTheDocument()
  })
})