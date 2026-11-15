import type { ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'

type VarianteBoton =
  | 'primario'
  | 'secundario'
  | 'peligro'
  | 'fantasma'

const CLASES_VARIANTE: Record<VarianteBoton, string> = {
  primario:
    'bg-indigo-600 text-white hover:bg-indigo-700',
  secundario:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  peligro:
    'bg-red-600 text-white hover:bg-red-700',
  fantasma:
    'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
}

interface BotonProps
  extends ComponentPropsWithoutRef<'button'> {
  cargando?: boolean
  textoCargando?: string
  variante?: VarianteBoton
}

export function Boton({
  cargando = false,
  textoCargando = 'Cargando…',
  variante = 'primario',
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
        'min-h-11 rounded-lg px-5 py-2.5',
        'font-semibold transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-indigo-600',
        'disabled:cursor-not-allowed disabled:opacity-60',
        CLASES_VARIANTE[variante],
        className,
      )}
    >
      {cargando ? textoCargando : children}
    </button>
  )
}