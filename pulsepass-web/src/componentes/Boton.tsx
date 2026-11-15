import type { ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'

interface BotonProps
  extends ComponentPropsWithoutRef<'button'> {
  cargando?: boolean
}

export function Boton({
  cargando = false,
  disabled,
  children,
  className,
  ...propiedades
}: BotonProps) {
  return (
    <button
      {...propiedades}
      disabled={disabled === true || cargando}
      aria-busy={cargando}
      className={clsx(
        'min-h-11 rounded-lg bg-indigo-600 px-5 py-2.5',
        'font-semibold text-white transition',
        'hover:bg-indigo-700',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-indigo-600',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      {cargando ? 'Creando cuenta…' : children}
    </button>
  )
}