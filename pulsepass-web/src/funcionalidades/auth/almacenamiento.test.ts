import { beforeEach, describe, expect, it } from 'vitest'
import { borrarSesion, guardarSesion, leerSesion } from './almacenamiento'

describe('almacenamiento de sesión', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('recupera una sesión válida', () => {
    guardarSesion({
      token: 'token-de-prueba',
      expiraEn: Date.now() + 60_000,
      usuario: {
        id: 1,
        username: 'user_e2e',
        email: 'user@pulsepass.test',
        roles: ['USER'],
      },
    })

    expect(leerSesion()?.usuario.roles).toContain('USER')
  })

  it('descarta una sesión expirada', () => {
    guardarSesion({
      token: 'token-expirado',
      expiraEn: Date.now() - 1,
      usuario: {
        id: 1,
        username: 'user_e2e',
        email: 'user@pulsepass.test',
        roles: ['USER'],
      },
    })

    expect(leerSesion()).toBeNull()
    expect(sessionStorage.length).toBe(0)
  })

  it('descarta contenido inválido de sessionStorage', () => {
    sessionStorage.setItem('pulsepass.sesion', '{contenido inválido')

    expect(leerSesion()).toBeNull()
    expect(sessionStorage.length).toBe(0)
  })

  it('elimina explícitamente la sesión', () => {
    sessionStorage.setItem('pulsepass.sesion', '{}')

    borrarSesion()

    expect(sessionStorage.length).toBe(0)
  })
})
