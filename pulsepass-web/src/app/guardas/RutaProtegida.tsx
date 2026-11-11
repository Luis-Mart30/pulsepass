import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../funcionalidades/auth/useAuth'
import { RUTAS } from '../../lib/rutas'

export default function RutaProtegida() {
  const { sesion } = useAuth()
  const location = useLocation()

  if (sesion.estado === 'cargando') {
    return <p role="status">Cargando sesión...</p>
  }

  if (sesion.estado === 'anonimo') {
    return (
      <Navigate
        to={RUTAS.LOGIN}
        replace
        state={{
          desde: `${location.pathname}${location.search}`,
        }}
      />
    )
  }

  return <Outlet />
}