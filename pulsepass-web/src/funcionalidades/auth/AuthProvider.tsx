import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { useNavigate } from 'react-router'
import { establecerManejador401, establecerTokenHttp } from '../../lib/http'
import { queryClient } from '../../lib/query-client'
import { RUTAS } from '../../lib/rutas'
import { borrarSesion, guardarSesion, leerSesion } from './almacenamiento'
import { iniciarSesionApi, obtenerUsuarioAutenticadoApi } from './api'
import { AuthContext, type AuthContextValue } from './AuthContext'
import type { LoginDatos, Rol, Sesion } from './tipos'

export function AuthProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const [sesionGuardadaInicial] = useState(leerSesion)

  const [sesion, setSesion] = useState<Sesion>(() => {
    if (sesionGuardadaInicial === null) {
      establecerTokenHttp(null)
      return { estado: 'anonimo' }
    }

    establecerTokenHttp(sesionGuardadaInicial.token)
    return { estado: 'cargando' }
  })

  const limpiarDatosSesion = useCallback(() => {
    borrarSesion()
    establecerTokenHttp(null)
    queryClient.clear()
    setSesion({ estado: 'anonimo' })
  }, [])

  const cerrarSesion = useCallback(() => {
    limpiarDatosSesion()
    navigate(RUTAS.INICIO, { replace: true })
  }, [limpiarDatosSesion, navigate])

  const cerrarSesionExpirada = useCallback(() => {
    limpiarDatosSesion()
    navigate(RUTAS.LOGIN, {
      replace: true,
      state: { motivo: 'expirada' },
    })
  }, [limpiarDatosSesion, navigate])

  const iniciarSesion = useCallback(
    async (datos: LoginDatos): Promise<void> => {
      const autenticacion = await iniciarSesionApi(datos)
      const expiraEn = Date.now() + autenticacion.expiresIn * 1_000

      establecerTokenHttp(autenticacion.accessToken)

      try {
        const usuario = await obtenerUsuarioAutenticadoApi()
        const sesionAutenticada: Sesion = {
          estado: 'autenticado',
          token: autenticacion.accessToken,
          expiraEn,
          usuario,
        }

        guardarSesion({
          token: sesionAutenticada.token,
          expiraEn: sesionAutenticada.expiraEn,
          usuario: sesionAutenticada.usuario,
        })

        setSesion(sesionAutenticada)
      } catch (error: unknown) {
        limpiarDatosSesion()
        throw error
      }
    },
    [limpiarDatosSesion],
  )

  useEffect(() => {
    establecerManejador401(cerrarSesionExpirada)

    return () => {
      establecerManejador401(() => undefined)
    }
  }, [cerrarSesionExpirada])

  useEffect(() => {
    if (sesionGuardadaInicial === null) {
      return
    }

    let activo = true

    void obtenerUsuarioAutenticadoApi()
      .then((usuario) => {
        if (!activo) {
          return
        }

        const sesionActualizada: Sesion = {
          estado: 'autenticado',
          token: sesionGuardadaInicial.token,
          expiraEn: sesionGuardadaInicial.expiraEn,
          usuario,
        }

        guardarSesion({
          token: sesionActualizada.token,
          expiraEn: sesionActualizada.expiraEn,
          usuario: sesionActualizada.usuario,
        })

        setSesion(sesionActualizada)
      })
      .catch(() => {
        if (activo) {
          cerrarSesionExpirada()
        }
      })

    return () => {
      activo = false
    }
  }, [cerrarSesionExpirada, sesionGuardadaInicial])

  useEffect(() => {
    if (sesion.estado !== 'autenticado') {
      return
    }

    const tiempoRestante = sesion.expiraEn - Date.now()
    const temporizador = window.setTimeout(
      cerrarSesionExpirada,
      Math.max(0, tiempoRestante),
    )

    return () => {
      window.clearTimeout(temporizador)
    }
  }, [cerrarSesionExpirada, sesion])

  const tieneRol = useCallback(
    (...roles: Rol[]) =>
      sesion.estado === 'autenticado' &&
      roles.some((rol) => sesion.usuario.roles.includes(rol)),
    [sesion],
  )

  const valor = useMemo<AuthContextValue>(
    () => ({
      sesion,
      iniciarSesion,
      cerrarSesion,
      tieneRol,
    }),
    [cerrarSesion, iniciarSesion, sesion, tieneRol],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
