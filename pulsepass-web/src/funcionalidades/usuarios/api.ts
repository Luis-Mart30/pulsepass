import { z } from 'zod'
import {
  UsuarioRegistradoSchema,
  type UsuarioRegistrado,
} from '../auth/tipos'
import { http } from '../../lib/http'

const EmailConsultaSchema = z.email()
const UsernameConsultaSchema = z.string().trim().min(1)

export function obtenerUsuarioPorEmailApi(
  email: string,
): Promise<UsuarioRegistrado> {
  const emailValidado = EmailConsultaSchema.parse(email)

  return http(
    `/users/by-email?email=${encodeURIComponent(emailValidado)}`,
    UsuarioRegistradoSchema,
  )
}

export function obtenerUsuarioPorUsernameApi(
  username: string,
): Promise<UsuarioRegistrado> {
  const usernameValidado = UsernameConsultaSchema.parse(username)

  return http(
    `/users/by-username?username=${encodeURIComponent(usernameValidado)}`,
    UsuarioRegistradoSchema,
  )
}
