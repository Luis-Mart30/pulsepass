import { http } from '../../lib/http'
import {
  AuthResponseSchema,
  LoginSchema,
  UsuarioAutenticadoSchema,
  type AuthResponse,
  type LoginDatos,
  type UsuarioAutenticado,
} from './tipos'

export function iniciarSesionApi(
  datos: LoginDatos,
): Promise<AuthResponse> {
  const datosValidados = LoginSchema.parse(datos)

  return http(
    '/auth/login',
    AuthResponseSchema,
    {
      method: 'POST',
      body: JSON.stringify(datosValidados),
    },
    { manejar401: false },
  )
}

export function obtenerUsuarioAutenticadoApi(): Promise<UsuarioAutenticado> {
  return http('/auth/me', UsuarioAutenticadoSchema)
}