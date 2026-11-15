import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../funcionalidades/auth/useAuth'
import { RUTAS } from '../../lib/rutas'
import type { Rol } from '../../funcionalidades/auth/tipos'

interface RutaPorRolProps {
  roles: Rol[]
}

export default function RutaPorRol({ roles }: RutaPorRolProps) {
  const { sesion, tieneRol } = useAuth()
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

  if (!tieneRol(...roles)) {
    return <Navigate to={RUTAS.SIN_PERMISOS} replace />
  }

  return <Outlet />
}
