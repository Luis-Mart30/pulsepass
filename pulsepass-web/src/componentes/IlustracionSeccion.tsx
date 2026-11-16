import clsx from 'clsx'
import './ExperienciaPulsePass.css'

interface IlustracionSeccionProps {
  tipo: 'artistas' | 'sedes' | 'acceso' | 'entradas'
  className?: string
}

export function IlustracionSeccion({
  tipo,
  className,
}: IlustracionSeccionProps) {
  return (
    <span
      aria-hidden="true"
      data-ilustracion={tipo}
      className={clsx('ilustracion-seccion movimiento-ilustracion', className)}
    />
  )
}
