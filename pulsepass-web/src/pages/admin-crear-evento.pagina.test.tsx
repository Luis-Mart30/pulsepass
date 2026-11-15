import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { server } from '../test/server'
import AdminCrearEvento from './AdminCrearEvento'
import AdminEventos from './AdminEventos'

const sede = {
  id: 1,
  code: 'VEN-01',
  name: 'Arena Central',
  city: 'Santa Marta',
  address: 'Carrera 1',
  capacity: 5000,
  active: true,
}

function renderizarPagina() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <MemoryRouter initialEntries={['/admin/eventos/nuevo']}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/admin/eventos/nuevo" element={<AdminCrearEvento />} />
          <Route
            path="/admin/eventos/:eventCode"
            element={
              <>
                <p>Gestión del evento creado</p>
                <Link to="/admin/eventos">Volver a eventos</Link>
              </>
            }
          />
          <Route path="/admin/eventos" element={<AdminEventos />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

async function completarFormulario() {
  const usuario = userEvent.setup()
  renderizarPagina()

  await screen.findByRole('option', {
    name: 'Arena Central — Santa Marta',
  })

  await usuario.type(screen.getByLabelText('Código del evento'), 'FEST-2027')
  await usuario.type(
    screen.getByLabelText('Nombre del evento'),
    'Festival del Caribe',
  )
  await usuario.type(
    screen.getByLabelText('Descripción'),
    'Un gran festival musical.',
  )
  await usuario.selectOptions(screen.getByLabelText('Categoría'), 'MUSIC')
  fireEvent.change(screen.getByLabelText('Fecha y hora'), {
    target: { value: '2027-02-20T19:00:00' },
  })
  await usuario.clear(screen.getByLabelText('Edad mínima'))
  await usuario.type(screen.getByLabelText('Edad mínima'), '18')
  await usuario.selectOptions(screen.getByLabelText('Sede'), 'VEN-01')

  return usuario
}

describe('página Crear evento', () => {
  it('valida los campos obligatorios sin crear el evento', async () => {
    const crear = vi.fn()

    server.use(
      http.get('/api/venues/active', () => HttpResponse.json([sede])),
      http.post('/api/events', async ({ request }) => {
        crear(await request.json())
        return HttpResponse.json({}, { status: 500 })
      }),
    )

    const usuario = userEvent.setup()
    renderizarPagina()

    await screen.findByRole('option', {
      name: 'Arena Central — Santa Marta',
    })
    await usuario.clear(screen.getByLabelText('Código del evento'))
    await usuario.clear(screen.getByLabelText('Nombre del evento'))
    await usuario.click(
      screen.getByRole('button', {
        name: 'Guardar borrador',
      }),
    )

    expect(crear).not.toHaveBeenCalled()
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
  })

  it('crea el borrador y lo muestra en los eventos de la sesión', async () => {
    server.use(
      http.get('/api/venues/active', () => HttpResponse.json([sede])),
      http.post('/api/events', async ({ request }) => {
        const datos = (await request.json()) as Record<string, unknown>

        return HttpResponse.json(
          {
            id: 10,
            ...datos,
            description: 'Un gran festival musical.',
            status: 'DRAFT',
            venueName: 'Arena Central',
            artists: [],
          },
          { status: 201 },
        )
      }),
    )

    const usuario = await completarFormulario()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Guardar borrador',
      }),
    )

    expect(
      await screen.findByText('Gestión del evento creado'),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('link', { name: 'Volver a eventos' }))

    expect(
      screen.getByRole('region', { name: 'Creados en esta sesión' }),
    ).toHaveTextContent('Borrador')
    const gestionar = screen.getByRole('link', {
      name: 'Gestionar Festival del Caribe (FEST-2027)',
    })
    expect(gestionar).toHaveAttribute('href', '/admin/eventos/FEST-2027')
    await usuario.click(gestionar)
    expect(screen.getByText('Gestión del evento creado')).toBeInTheDocument()
  })

  it('muestra los errores 400 del servidor en los campos correspondientes', async () => {
    server.use(
      http.get('/api/venues/active', () => HttpResponse.json([sede])),
      http.post('/api/events', () =>
        HttpResponse.json(
          {
            timestamp: '2026-11-15T00:00:00Z',
            status: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            details: {
              name: 'El nombre del evento no es válido.',
              category: 'Revisa la categoria seleccionada.',
              venueCode: 'Revisa la sede seleccionada.',
            },
          },
          { status: 400 },
        ),
      ),
    )

    const usuario = await completarFormulario()
    await usuario.click(
      screen.getByRole('button', { name: 'Guardar borrador' }),
    )

    expect(
      await screen.findByText('El nombre del evento no es válido.'),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Nombre del evento'),
    ).toHaveAccessibleDescription('El nombre del evento no es válido.')
    expect(screen.getByLabelText('Categoría')).toHaveAccessibleDescription(
      'Revisa la categoria seleccionada.',
    )
    expect(screen.getByLabelText('Sede')).toHaveAccessibleDescription(
      'Revisa la sede seleccionada.',
    )
    expect(
      screen.queryByText('Gestión del evento creado'),
    ).not.toBeInTheDocument()
  })

  it('muestra un mensaje cuando el código está duplicado', async () => {
    server.use(
      http.get('/api/venues/active', () => HttpResponse.json([sede])),
      http.post('/api/events', () =>
        HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'Event code already exists',
          },
          { status: 409 },
        ),
      ),
    )

    const usuario = await completarFormulario()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Guardar borrador',
      }),
    )

    expect(
      await screen.findByText('Ya existe un evento registrado con ese código.'),
    ).toBeInTheDocument()
  })
})
