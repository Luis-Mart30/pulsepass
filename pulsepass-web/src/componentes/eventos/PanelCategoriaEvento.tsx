import clsx from 'clsx'
import type { CategoriaEvento } from '../../funcionalidades/eventos/tipos'
import './PanelCategoriaEvento.css'

const CATEGORIAS: Record<CategoriaEvento, { clases: string; icono: string }> = {
  MUSIC: {
    clases:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200',
    icono:
      'M9 18V5l12-2v13M9 18c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2ZM21 16c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2Z',
  },
  TECHNOLOGY: {
    clases: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    icono: 'M3 4h18v13H3zM12 17v4m-4 0h8',
  },
  SPORTS: {
    clases:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    icono: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0v18M3 12h18',
  },
  CULTURE: {
    clases: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    icono: 'm3 9 9-6 9 6M5 10h14M6 11v8m6-8v8m6-8v8M3 21h18',
  },
  EDUCATION: {
    clases: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
    icono: 'm2 10 10-5 10 5-10 5-10-5Zm4 2v5c4 3 8 3 12 0v-5m4-2v6',
  },
  ENTERTAINMENT: {
    clases:
      'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    icono:
      'm12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.5 6.3-.9L12 3Z',
  },
}

interface PanelCategoriaEventoProps {
  categoria: CategoriaEvento
  className?: string
}

export function PanelCategoriaEvento({
  categoria,
  className,
}: PanelCategoriaEventoProps) {
  const apariencia = CATEGORIAS[categoria]

  return (
    <div
      aria-hidden="true"
      data-categoria={categoria}
      className={clsx(
        'panel-categoria-evento grid min-h-28 place-items-center',
        apariencia.clases,
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        className="size-9"
      >
        <path d={apariencia.icono} />
      </svg>
    </div>
  )
}
