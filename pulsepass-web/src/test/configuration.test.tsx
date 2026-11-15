import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function TestComponent() {
  return <h1>PulsePass</h1>
}

describe('configuración de pruebas', () => {
  it('renderiza componentes React en JSDOM', () => {
    render(<TestComponent />)

    expect(
      screen.getByRole('heading', { name: 'PulsePass' }),
    ).toBeInTheDocument()
  })
})
