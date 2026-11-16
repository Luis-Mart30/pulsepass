import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../../funcionalidades/auth/useAuth'
import { RUTAS } from '../../lib/rutas'

export default function SoloAnonimo() {
  const { sesion } = useAuth()

  if (sesion.estado === 'cargando') {
    return <p role="status">Cargando sesión...</p>
  }

  if (sesion.estado === 'autenticado') {
    return <Navigate to={RUTAS.INICIO} replace />
  }

  return <Outlet />
}
