import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

function EjemploModal() {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)}>
        Abrir modal
      </button>
      <Modal
        abierto={abierto}
        titulo="Confirmar acción"
        onCerrar={() => setAbierto(false)}
      >
        <button type="button">Primera acción</button>
        <button type="button">Última acción</button>
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('mueve el foco, lo atrapa y lo devuelve al cerrar con Escape', async () => {
    const usuario = userEvent.setup()
    render(<EjemploModal />)

    const apertura = screen.getByRole('button', {
      name: 'Abrir modal',
    })
    await usuario.click(apertura)

    const primera = screen.getByRole('button', {
      name: 'Primera acción',
    })
    const ultima = screen.getByRole('button', {
      name: 'Última acción',
    })
    expect(primera).toHaveFocus()

    await usuario.tab({ shift: true })
    expect(ultima).toHaveFocus()
    await usuario.tab()
    expect(primera).toHaveFocus()

    await usuario.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(apertura).toHaveFocus()
  })

  it('impide cerrar el diálogo mientras la acción está bloqueada', async () => {
    const usuario = userEvent.setup()
    const onCerrar = vi.fn()

    render(
      <Modal abierto titulo="Procesando" onCerrar={onCerrar} bloquearCierre>
        <button type="button" disabled>
          Guardando
        </button>
      </Modal>,
    )

    await usuario.keyboard('{Escape}')
    expect(onCerrar).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
