import clsx from 'clsx'
import type { EstadoEvento } from '../../funcionalidades/eventos/tipos'

const CLASES_ESTADO: Record<EstadoEvento, string> = {
  DRAFT: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  PUBLISHED:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  SOLD_OUT: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  FINISHED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
}

interface EstadoEventoEtiquetaProps {
  estado: EstadoEvento
  className?: string
}

export function EstadoEventoEtiqueta({
  estado,
  className,
}: EstadoEventoEtiquetaProps) {
  return (
    <p
      className={clsx(
        'w-fit rounded-full px-2.5 py-1 text-xs font-semibold',
        CLASES_ESTADO[estado],
        className,
      )}
    >
      {estado}
    </p>
  )
}
