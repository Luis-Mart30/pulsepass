import { http } from '../../lib/http'
import {
  AuthResponseSchema,
  LoginSchema,
  RegistroSchema,
  UsuarioAutenticadoSchema,
  UsuarioRegistradoSchema,
  type AuthResponse,
  type LoginDatos,
  type RegistroDatos,
  type UsuarioAutenticado,
  type UsuarioRegistrado,
} from './tipos'

export function iniciarSesionApi(datos: LoginDatos): Promise<AuthResponse> {
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

export function registrarUsuarioApi(
  datos: RegistroDatos,
): Promise<UsuarioRegistrado> {
  const datosValidados = RegistroSchema.parse(datos)

  return http(
    '/users',
    UsuarioRegistradoSchema,
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
