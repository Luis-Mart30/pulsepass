import {
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { Rol } from '../funcionalidades/auth/tipos'
import Layout from './Layout'

const mocks = vi.hoisted(() => ({
  cerrarSesion: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('../funcionalidades/auth/useAuth', () => ({
  useAuth: mocks.useAuth,
}))

function configurarSesion(roles: Rol[] | null) {
  if (roles === null) {
    mocks.useAuth.mockReturnValue({
      sesion: { estado: 'anonimo' },
      iniciarSesion: vi.fn(),
      cerrarSesion: mocks.cerrarSesion,
      tieneRol: () => false,
    })
    return
  }

  mocks.useAuth.mockReturnValue({
    sesion: {
      estado: 'autenticado',
      token: 'token-prueba',
      expiraEn: 2_000_000_000_000,
      usuario: {
        id: 1,
        username: 'andrea',
        email: 'andrea@pulsepass.test',
        roles,
      },
    },
    iniciarSesion: vi.fn(),
    cerrarSesion: mocks.cerrarSesion,
    tieneRol: (...rolesBuscados: Rol[]) =>
      rolesBuscados.some((rol) => roles.includes(rol)),
  })
}

function renderizarLayout(ruta = '/') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<h1>Inicio</h1>} />
          <Route path="eventos" element={<h1>Eventos</h1>} />
          <Route path="artistas" element={<h1>Artistas</h1>} />
          <Route path="sedes" element={<h1>Sedes</h1>} />
          <Route path="login" element={<h1>Login</h1>} />
          <Route path="registro" element={<h1>Registro</h1>} />
          <Route path="cuenta" element={<h1>Cuenta</h1>} />
          <Route
            path="mis-tickets"
            element={<h1>Mis tickets</h1>}
          />
          <Route
            path="staff/validacion"
            element={<h1>Validación</h1>}
          />
          <Route
            path="admin/eventos"
            element={<h1>Administración</h1>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Layout y navegación por rol', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra navegación pública para una sesión anónima', () => {
    configurarSesion(null)
    renderizarLayout('/eventos')

    expect(
      screen.getByRole('link', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Registrarse' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Mis tickets' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Eventos' }),
    ).toHaveClass('bg-violet-100')
  })

  it('muestra las opciones correspondientes al rol USER', async () => {
    configurarSesion(['USER'])
    renderizarLayout()

    await userEvent.setup().click(
      screen.getByRole('button', { name: /andrea/i }),
    )

    const menu = screen.getByRole('menu')
    expect(
      within(menu).getByRole('menuitem', {
        name: 'Mi cuenta',
      }),
    ).toBeInTheDocument()
    expect(
      within(menu).getByRole('menuitem', {
        name: 'Mis tickets',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Validar ingreso' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', {
        name: 'Administrar eventos',
      }),
    ).not.toBeInTheDocument()
  })

  it('muestra validación de ingreso para STAFF', async () => {
    configurarSesion(['STAFF'])
    renderizarLayout()

    expect(
      screen.getByRole('link', { name: 'Validar ingreso' }),
    ).toHaveAttribute('href', '/staff/validacion')
    expect(
      screen.queryByRole('link', {
        name: 'Administrar eventos',
      }),
    ).not.toBeInTheDocument()

    await userEvent.setup().click(
      screen.getByRole('button', { name: /andrea/i }),
    )
    expect(
      within(screen.getByRole('menu')).queryByRole('menuitem', {
        name: 'Mis tickets',
      }),
    ).not.toBeInTheDocument()
  })

  it('muestra validación y administración para ADMIN', () => {
    configurarSesion(['ADMIN'])
    renderizarLayout()

    expect(
      screen.getByRole('link', { name: 'Validar ingreso' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Administrar eventos',
      }),
    ).toHaveAttribute('href', '/admin/eventos')
  })

  it('abre y cierra el menú móvil usando el teclado', async () => {
    configurarSesion(null)
    renderizarLayout()
    const usuario = userEvent.setup()
    const boton = screen.getByRole('button', {
      name: 'Abrir menú principal',
    })

    boton.focus()
    await usuario.keyboard('{Enter}')

    expect(boton).toHaveAttribute('aria-expanded', 'true')
    expect(
      document.getElementById('menu-movil'),
    ).toBeInTheDocument()

    await usuario.keyboard('{Escape}')

    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(
      document.getElementById('menu-movil'),
    ).not.toBeInTheDocument()
    expect(boton).toHaveFocus()
  })

  it('cierra sesión desde el menú de usuario', async () => {
    configurarSesion(['USER'])
    renderizarLayout()
    const usuario = userEvent.setup()

    await usuario.click(
      screen.getByRole('button', { name: /andrea/i }),
    )
    await usuario.click(
      within(screen.getByRole('menu')).getByRole('menuitem', {
        name: 'Salir',
      }),
    )

    expect(mocks.cerrarSesion).toHaveBeenCalledOnce()
  })
})
