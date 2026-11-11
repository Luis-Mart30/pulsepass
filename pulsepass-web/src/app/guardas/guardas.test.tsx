import { render, screen } from '@testing-library/react'
import {
  createMemoryRouter,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it } from 'vitest'
import {
  AuthContext,
  type AuthContextValue,
} from '../../funcionalidades/auth/AuthContext'
import type {
  Rol,
  Sesion,
} from '../../funcionalidades/auth/tipos'
import RutaPorRol from './RutaPorRol'
import RutaProtegida from './RutaProtegida'
import SoloAnonimo from './SoloAnonimo'

const sesionAnonima: Sesion = { estado: 'anonimo' }

const sesionUser: Sesion = {
  estado: 'autenticado',
  token: 'token-user',
  expiraEn: Date.now() + 60_000,
  usuario: {
    id: 1,
    username: 'user_e2e',
    email: 'user@pulsepass.test',
    roles: ['USER'],
  },
}

const sesionAdmin: Sesion = {
  estado: 'autenticado',
  token: 'token-admin',
  expiraEn: Date.now() + 60_000,
  usuario: {
    id: 2,
    username: 'admin_e2e',
    email: 'admin@pulsepass.test',
    roles: ['ADMIN'],
  },
}

function renderizarRutas(
  rutas: RouteObject[],
  rutaInicial: string,
  sesion: Sesion,
) {
  const tieneRol = (...roles: Rol[]) =>
    sesion.estado === 'autenticado' &&
    roles.some((rol) => sesion.usuario.roles.includes(rol))

  const valor: AuthContextValue = {
    sesion,
    iniciarSesion: () => Promise.resolve(),
    cerrarSesion: () => undefined,
    tieneRol,
  }

  const router = createMemoryRouter(rutas, {
    initialEntries: [rutaInicial],
  })

  return render(
    <AuthContext.Provider value={valor}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  )
}

describe('guardas de rutas', () => {
  it('RutaProtegida envía al anónimo a login', async () => {
    renderizarRutas(
      [
        {
          element: <RutaProtegida />,
          children: [
            {
              path: '/cuenta',
              element: <h1>Mi cuenta</h1>,
            },
          ],
        },
        {
          path: '/login',
          element: <h1>Iniciar sesión</h1>,
        },
      ],
      '/cuenta',
      sesionAnonima,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Iniciar sesión',
      }),
    ).toBeInTheDocument()
  })

  it('RutaProtegida permite una sesión autenticada', async () => {
    renderizarRutas(
      [
        {
          element: <RutaProtegida />,
          children: [
            {
              path: '/cuenta',
              element: <h1>Mi cuenta</h1>,
            },
          ],
        },
      ],
      '/cuenta',
      sesionUser,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Mi cuenta',
      }),
    ).toBeInTheDocument()
  })

  it('RutaPorRol envía a 403 cuando falta el rol', async () => {
    renderizarRutas(
      [
        {
          element: <RutaPorRol roles={['ADMIN']} />,
          children: [
            {
              path: '/admin/eventos',
              element: <h1>Administrar eventos</h1>,
            },
          ],
        },
        {
          path: '/403',
          element: <h1>Sin permisos</h1>,
        },
      ],
      '/admin/eventos',
      sesionUser,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Sin permisos',
      }),
    ).toBeInTheDocument()
  })

  it('RutaPorRol permite el rol requerido', async () => {
    renderizarRutas(
      [
        {
          element: <RutaPorRol roles={['ADMIN']} />,
          children: [
            {
              path: '/admin/eventos',
              element: <h1>Administrar eventos</h1>,
            },
          ],
        },
      ],
      '/admin/eventos',
      sesionAdmin,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Administrar eventos',
      }),
    ).toBeInTheDocument()
  })

  it('SoloAnonimo redirige una sesión autenticada', async () => {
    renderizarRutas(
      [
        {
          element: <SoloAnonimo />,
          children: [
            {
              path: '/login',
              element: <h1>Iniciar sesión</h1>,
            },
          ],
        },
        {
          path: '/',
          element: <h1>Inicio</h1>,
        },
      ],
      '/login',
      sesionUser,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Inicio',
      }),
    ).toBeInTheDocument()
  })
})