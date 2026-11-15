import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
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
})
