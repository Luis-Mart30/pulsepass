import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import { describe, expect, it } from 'vitest'
import { server } from '../test/server'
import AdminGestionEvento from './AdminGestionEvento'

const artista = {
  id: 8,
  stageName: 'Solar Beat',
  country: 'Colombia',
  genre: 'Electronic',
  active: true,
}

const eventoBase = {
  id: 10,
  eventCode: 'FEST-2027',
  name: 'Festival del Caribe',
  description: 'Un gran festival musical.',
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
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <MemoryRouter
      initialEntries={['/admin/eventos/FEST-2027']}
    >
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route
            path="/admin/eventos/:eventCode"
            element={<AdminGestionEvento />}
          />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

function configurarConsultas() {
  server.use(
    http.get('/api/events/FEST-2027', () =>
      HttpResponse.json(eventoBase),
    ),
    http.get('/api/artists/active', () =>
      HttpResponse.json([artista]),
    ),
  )
}

describe('página Gestionar evento', () => {
  it('muestra el detalle administrativo del evento', async () => {
    configurarConsultas()
    renderizarPagina()

    expect(
      await screen.findByRole('heading', {
        name: 'Festival del Caribe',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Borrador')).toBeInTheDocument()
    expect(screen.getByText('Arena Central')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Publicar evento',
      }),
    ).toBeEnabled()
  })

  it('asocia un artista y actualiza el evento', async () => {
    configurarConsultas()
    server.use(
      http.post(
        '/api/events/FEST-2027/artists/8',
        () =>
          HttpResponse.json({
            ...eventoBase,
            artists: [artista],
          }),
      ),
    )

    const usuario = userEvent.setup()
    renderizarPagina()

    await screen.findByRole('option', {
      name: 'Solar Beat',
    })
    await usuario.selectOptions(
      screen.getByLabelText('Agregar artista'),
      '8',
    )
    await usuario.click(
      screen.getByRole('button', {
        name: 'Asociar artista',
      }),
    )

    expect(
      await screen.findByText('Artista asociado correctamente.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Solar Beat')).toBeInTheDocument()
  })

  it('publica el evento después de confirmar', async () => {
    configurarConsultas()

    let publicado = false

    server.use(
      http.get('/api/events/FEST-2027', () =>
        HttpResponse.json({
          ...eventoBase,
          status: publicado ? 'PUBLISHED' : 'DRAFT',
        }),
      ),
      http.patch(
        '/api/events/FEST-2027/publish',
        () => {
          publicado = true

          return HttpResponse.json({
            ...eventoBase,
            status: 'PUBLISHED',
          })
        },
      ),
    )

    const usuario = userEvent.setup()
    renderizarPagina()

    await screen.findByRole('heading', {
      name: 'Festival del Caribe',
    })
    await usuario.click(
      screen.getByRole('button', {
        name: 'Publicar evento',
      }),
    )

    expect(
      screen.getByRole('dialog', {
        name: '¿Publicar este evento?',
      }),
    ).toBeInTheDocument()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Confirmar publicación',
      }),
    )

    expect(
      await screen.findByText(
        'Evento publicado correctamente.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Publicar evento',
      }),
    ).toBeDisabled()
  })
})