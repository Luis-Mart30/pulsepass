import { createContext } from 'react'
import type { LoginDatos, Rol, Sesion } from './tipos'

export interface AuthContextValue {
  sesion: Sesion
  iniciarSesion: (datos: LoginDatos) => Promise<void>
  cerrarSesion: () => void
  tieneRol: (...roles: Rol[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
