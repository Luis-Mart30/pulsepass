import { z } from 'zod'

export const LoginSchema = z.object({
  identifier: z.string().trim().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

function esFechaNacimientoValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false
  }

  const fecha = new Date(`${valor}T00:00:00`)
  const hoy = new Date()
  hoy.setHours(23, 59, 59, 999)

  return (
    !Number.isNaN(fecha.getTime()) &&
    fecha.toISOString().slice(0, 10) === valor &&
    fecha <= hoy
  )
}

export const RegistroSchema = z.object({
  username: z.string().trim().min(1, 'Ingresa un nombre de usuario'),
  email: z.email('Ingresa un correo válido'),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .refine(
      (password) =>
        new TextEncoder().encode(password).length <= 72,
      'La contraseña no puede superar 72 bytes',
    ),
  firstName: z.string().trim().min(1, 'Ingresa tu nombre'),
  lastName: z.string().trim().min(1, 'Ingresa tu apellido'),
  birthDate: z
    .string()
    .refine(
      esFechaNacimientoValida,
      'Selecciona una fecha de nacimiento válida',
    ),
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

export const UsuarioRegistradoSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(1),
  email: z.email(),
  active: z.boolean(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().nullable(),
  city: z.string().nullable(),
  birthDate: z.string(),
})

export const SesionGuardadaSchema = z.object({
  token: z.string().min(1),
  expiraEn: z.number().int().positive(),
  usuario: UsuarioAutenticadoSchema,
})

export type LoginDatos = z.infer<typeof LoginSchema>
export type RegistroDatos = z.infer<typeof RegistroSchema>
export type Rol = z.infer<typeof RolSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type UsuarioAutenticado = z.infer<
  typeof UsuarioAutenticadoSchema
>
export type UsuarioRegistrado = z.infer<
  typeof UsuarioRegistradoSchema
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