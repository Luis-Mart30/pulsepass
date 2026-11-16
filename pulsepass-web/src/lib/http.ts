import { z, type ZodType } from 'zod'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(
  /\/$/,
  '',
)

export const ErrorResponseSchema = z.object({
  timestamp: z.string(),
  status: z.number().int(),
  error: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.string()),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

export class ApiError extends Error {
  readonly status: number
  readonly details: Record<string, string>

  constructor(
    status: number,
    message: string,
    details: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

let tokenActual: string | null = null
let manejarNoAutorizado: () => void = () => undefined

export function establecerTokenHttp(token: string | null): void {
  tokenActual = token
}

export function establecerManejador401(manejador: () => void): void {
  manejarNoAutorizado = manejador
}

async function crearApiError(respuesta: Response): Promise<ApiError> {
  try {
    const cuerpo: unknown = await respuesta.json()
    const resultado = ErrorResponseSchema.safeParse(cuerpo)

    if (resultado.success) {
      return new ApiError(
        respuesta.status,
        resultado.data.message,
        resultado.data.details,
      )
    }
  } catch {
    // El servidor respondió con un cuerpo que no es JSON.
  }

  return new ApiError(
    respuesta.status,
    'No fue posible completar la solicitud.',
  )
}

export async function http<T>(
  ruta: string,
  esquema: ZodType<T>,
  opciones: RequestInit = {},
  configuracion: { manejar401?: boolean } = {},
): Promise<T> {
  const headers = new Headers(opciones.headers)

  headers.set('Accept', 'application/json')

  if (opciones.body !== undefined && !(opciones.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (tokenActual !== null) {
    headers.set('Authorization', `Bearer ${tokenActual}`)
  }

  try {
    const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
      ...opciones,
      headers,
    })

    if (!respuesta.ok) {
      if (respuesta.status === 401 && configuracion.manejar401 !== false) {
        manejarNoAutorizado()
      }

      throw await crearApiError(respuesta)
    }

    const cuerpo: unknown =
      respuesta.status === 204 ? undefined : await respuesta.json()

    const resultado = esquema.safeParse(cuerpo)

    if (!resultado.success) {
      throw new ApiError(
        500,
        'La respuesta del servidor no tiene el formato esperado.',
      )
    }

    return resultado.data
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(0, 'No se pudo contactar el servidor.')
  }
}
