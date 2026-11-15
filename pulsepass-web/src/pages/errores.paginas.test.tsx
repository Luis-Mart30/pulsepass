import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import ErrorPagina from './ErrorPagina'
import NoEncontrada from './NoEncontrada'
import SinPermisos from './SinPermisos'

describe('páginas de error', () => {
  it('muestra la página 403 con alternativas de navegación', () => {
    render(
      <MemoryRouter>
        <SinPermisos />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: 'No tienes permisos',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'Volver al inicio',
      }),
    ).toHaveAttribute('href', '/')

    expect(
      screen.getByRole('link', {
        name: 'Explorar eventos',
      }),
    ).toHaveAttribute('href', '/eventos')
  })

  it('muestra la página 404 con alternativas de navegación', () => {
    render(
      <MemoryRouter>
        <NoEncontrada />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Página no encontrada',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'Volver al inicio',
      }),
    ).toHaveAttribute('href', '/')

    expect(
      screen.getByRole('link', {
        name: 'Explorar eventos',
      }),
    ).toHaveAttribute('href', '/eventos')
  })

  it.each([
    [
      new Error('Traza interna de prueba'),
      'Ocurrió un error inesperado al cargar la página.',
    ],
    [
      new Response('Detalles internos de prueba', {
        status: 500,
        statusText: 'Traza interna de prueba',
      }),
      'Error 500 al cargar la página.',
    ],
  ])(
    'muestra un mensaje seguro y permite salir del error (%#)',
    async (error, mensaje) => {
      const usuario = userEvent.setup()
      const router = createMemoryRouter(
        [
          { path: '/', element: <h1>Inicio</h1> },
          {
            path: '/eventos',
            loader: () => {
              throw error
            },
            element: <h1>Eventos</h1>,
            HydrateFallback: () => null,
            errorElement: <ErrorPagina />,
          },
        ],
        { initialEntries: ['/eventos?categoria=MUSIC#lista'] },
      )
      render(<RouterProvider router={router} />)

      expect(await screen.findByRole('alert')).toHaveTextContent(mensaje)
      expect(
        screen.queryByText(/intern[ao]s? de prueba/i),
      ).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled()

      await usuario.click(
        screen.getByRole('link', { name: 'Volver al inicio' }),
      )
      expect(
        await screen.findByRole('heading', { name: 'Inicio' }),
      ).toBeInTheDocument()
    },
  )
})
