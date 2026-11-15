import { z } from 'zod'
import {
  UsuarioRegistradoSchema,
  type UsuarioRegistrado,
} from '../auth/tipos'
import { http } from '../../lib/http'

const EmailConsultaSchema = z.email()

export function obtenerUsuarioPorEmailApi(
  email: string,
): Promise<UsuarioRegistrado> {
  const emailValidado = EmailConsultaSchema.parse(email)

  return http(
    `/users/by-email?email=${encodeURIComponent(emailValidado)}`,
    UsuarioRegistradoSchema,
  )
}