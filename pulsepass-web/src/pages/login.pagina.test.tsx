import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AuthContext,
  type AuthContextValue,
} from '../funcionalidades/auth/AuthContext'
import { ApiError } from '../lib/http'
import Login from './Login'

const iniciarSesion = vi.fn<AuthContextValue['iniciarSesion']>()

const contexto: AuthContextValue = {
  sesion: { estado: 'anonimo' },
  iniciarSesion,
  cerrarSesion: vi.fn(),
  tieneRol: () => false,
}

function renderizarLogin(estado?: Record<string, unknown>) {
  return render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/login',
            state: estado,
          },
        ]}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/destino" element={<p>Página privada</p>} />
          <Route path="/" element={<p>Inicio</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

async function completarLogin() {
  const usuario = userEvent.setup()

  await usuario.type(screen.getByLabelText('Usuario o correo'), 'andrea')
  await usuario.type(screen.getByLabelText('Contraseña'), 'Contraseña123')

  return usuario
}

describe('página de inicio de sesión', () => {
  beforeEach(() => {
    iniciarSesion.mockReset()
  })

  it('valida campos obligatorios sin iniciar sesión', async () => {
    const usuario = userEvent.setup()

    renderizarLogin()

    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(
      await screen.findByText('Ingresa tu usuario o correo'),
    ).toBeInTheDocument()
    expect(iniciarSesion).not.toHaveBeenCalled()
  })

  it('inicia sesión y regresa a la ruta de origen', async () => {
    iniciarSesion.mockResolvedValue()

    renderizarLogin({ desde: '/destino' })
    const usuario = await completarLogin()

    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Página privada')).toBeInTheDocument()

    expect(iniciarSesion).toHaveBeenCalledWith({
      identifier: 'andrea',
      password: 'Contraseña123',
    })
  })

  it('muestra un mensaje genérico para un error 401', async () => {
    iniciarSesion.mockRejectedValue(new ApiError(401, 'Usuario inexistente'))

    renderizarLogin()
    const usuario = await completarLogin()

    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(
      await screen.findByText('Credenciales inválidas.'),
    ).toBeInTheDocument()
  })

  it('muestra el aviso después de crear una cuenta', () => {
    renderizarLogin({ registrado: true })

    expect(
      screen.getByText('Cuenta creada, inicia sesión.'),
    ).toBeInTheDocument()
  })
})
