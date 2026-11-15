import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { ApiError } from '../lib/http'
import Registro from './Registro'

const mocks = vi.hoisted(() => ({
  registrarUsuarioApi: vi.fn(),
}))

vi.mock('../funcionalidades/auth/api', () => ({
  registrarUsuarioApi: mocks.registrarUsuarioApi,
}))

function DestinoLogin() {
  const ubicacion = useLocation()
  const estado = ubicacion.state as {
    registrado?: boolean
  } | null

  return (
    <p>
      {estado?.registrado === true
        ? 'Cuenta creada, inicia sesión'
        : 'Inicio de sesión'}
    </p>
  )
}

function renderizarRegistro() {
  return render(
    <MemoryRouter initialEntries={['/registro']}>
      <Routes>
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<DestinoLogin />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function completarFormulario() {
  const usuario = userEvent.setup()

  await usuario.type(
    screen.getByLabelText('Nombre de usuario'),
    'andrea',
  )
  await usuario.type(
    screen.getByLabelText('Correo electrónico'),
    'andrea@pulsepass.test',
  )
  await usuario.type(screen.getByLabelText('Nombres'), 'Andrea')
  await usuario.type(screen.getByLabelText('Apellidos'), 'Ruiz')
  await usuario.type(
    screen.getByLabelText('Fecha de nacimiento'),
    '1998-04-12',
  )
  await usuario.type(
    screen.getByLabelText('Contraseña (mín. 12 caracteres)'),
    'Contraseña123',
  )

  return usuario
}

describe('página de registro', () => {
  beforeEach(() => {
    mocks.registrarUsuarioApi.mockReset()
  })

  it('valida campos obligatorios sin consultar la API', async () => {
    const usuario = userEvent.setup()

    renderizarRegistro()

    await usuario.click(
      screen.getByRole('button', { name: 'Crear cuenta' }),
    )

    expect(
      await screen.findByText('Ingresa un nombre de usuario'),
    ).toBeInTheDocument()
    expect(mocks.registrarUsuarioApi).not.toHaveBeenCalled()
  })

  it('crea la cuenta y redirige al login', async () => {
    mocks.registrarUsuarioApi.mockResolvedValue({
      id: 1,
      username: 'andrea',
      email: 'andrea@pulsepass.test',
      active: true,
      firstName: 'Andrea',
      lastName: 'Ruiz',
      phone: null,
      city: null,
      birthDate: '1998-04-12',
    })

    renderizarRegistro()
    const usuario = await completarFormulario()

    await usuario.click(
      screen.getByRole('button', { name: 'Crear cuenta' }),
    )

    expect(
      await screen.findByText('Cuenta creada, inicia sesión'),
    ).toBeInTheDocument()

    expect(mocks.registrarUsuarioApi).toHaveBeenCalledWith({
      username: 'andrea',
      email: 'andrea@pulsepass.test',
      firstName: 'Andrea',
      lastName: 'Ruiz',
      birthDate: '1998-04-12',
      password: 'Contraseña123',
    })
  })

  it('muestra un mensaje genérico cuando existe duplicado', async () => {
    mocks.registrarUsuarioApi.mockRejectedValue(
      new ApiError(409, 'Conflicto interno'),
    )

    renderizarRegistro()
    const usuario = await completarFormulario()

    await usuario.click(
      screen.getByRole('button', { name: 'Crear cuenta' }),
    )

    expect(
      await screen.findByRole('alert', {
        name: '',
      }),
    ).toHaveTextContent(
      'El usuario o correo ya está registrado.',
    )
  })
})