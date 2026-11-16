import { SesionGuardadaSchema, type SesionGuardada } from './tipos'

const CLAVE_SESION = 'pulsepass.sesion'

export function guardarSesion(sesion: SesionGuardada): void {
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
}

export function leerSesion(): SesionGuardada | null {
  const valor = sessionStorage.getItem(CLAVE_SESION)

  if (valor === null) {
    return null
  }

  try {
    const resultado = SesionGuardadaSchema.safeParse(JSON.parse(valor))

    if (!resultado.success || resultado.data.expiraEn <= Date.now()) {
      borrarSesion()
      return null
    }

    return resultado.data
  } catch {
    borrarSesion()
    return null
  }
}

export function borrarSesion(): void {
  sessionStorage.removeItem(CLAVE_SESION)
}
