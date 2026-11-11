import { z } from 'zod'

export const LoginSchema = z.object({
  identifier: z.string().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])

export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
})

export const UsuarioAutenticadoSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(1),
  email: z.email(),
  roles: z.array(RolSchema).min(1),
})

export const SesionGuardadaSchema = z.object({
  token: z.string().min(1),
  expiraEn: z.number().int().positive(),
  usuario: UsuarioAutenticadoSchema,
})

export type LoginDatos = z.infer<typeof LoginSchema>
export type Rol = z.infer<typeof RolSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type UsuarioAutenticado = z.infer<
  typeof UsuarioAutenticadoSchema
>
export type SesionGuardada = z.infer<typeof SesionGuardadaSchema>

export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo' }
  | {
      estado: 'autenticado'
      token: string
      expiraEn: number
      usuario: UsuarioAutenticado
    }