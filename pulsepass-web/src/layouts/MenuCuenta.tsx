import { NavLink } from 'react-router'
import { RUTAS } from '../lib/rutas'
import './MenuCuenta.css'

const ICONOS = {
  cuenta:
    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  tickets: 'M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6Zm11 2v2m0 4v2',
  salir: 'M10 4H5v16h5m3-8h8m-4-4 4 4-4 4',
}

function IconoOpcion({ tipo }: { tipo: keyof typeof ICONOS }) {
  return (
    <span className="cuenta-opcion-icono" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <path d={ICONOS[tipo]} />
      </svg>
    </span>
  )
}

export function AvatarCuenta({ username }: { username: string }) {
  return (
    <span className="cuenta-inicial" aria-hidden="true">
      {username.charAt(0).toUpperCase()}
    </span>
  )
}

interface MenuCuentaProps {
  username: string
  desplegable?: boolean
  mostrarTickets: boolean
  alNavegar: () => void
  alSalir: () => void
}

export function MenuCuenta({
  username,
  desplegable = false,
  mostrarTickets,
  alNavegar,
  alSalir,
}: MenuCuentaProps) {
  const rolOpcion = desplegable ? 'menuitem' : undefined

  return (
    <div
      id={desplegable ? 'menu-usuario' : undefined}
      role={desplegable ? 'menu' : undefined}
      className={
        desplegable ? 'cuenta-menu cuenta-menu-desplegable' : 'cuenta-menu'
      }
    >
      <div className="cuenta-identidad" aria-hidden={desplegable || undefined}>
        <AvatarCuenta username={username} />
        <strong>{username}</strong>
      </div>
      <NavLink
        to={RUTAS.CUENTA}
        role={rolOpcion}
        className="cuenta-opcion"
        onClick={alNavegar}
      >
        <IconoOpcion tipo="cuenta" />
        Mi cuenta
      </NavLink>
      {mostrarTickets ? (
        <NavLink
          to={RUTAS.MIS_TICKETS}
          role={rolOpcion}
          className="cuenta-opcion"
          onClick={alNavegar}
        >
          <IconoOpcion tipo="tickets" />
          Mis tickets
        </NavLink>
      ) : null}
      <button
        type="button"
        role={rolOpcion}
        className="cuenta-opcion cuenta-opcion-salir"
        onClick={alSalir}
      >
        <IconoOpcion tipo="salir" />
        Salir
      </button>
    </div>
  )
}
