import { Link } from 'react-router'
import type { Artista } from '../../funcionalidades/artistas/tipos'
import { crearRuta } from '../../lib/rutas'

interface AvatarArtistaProps {
  artista: Artista
}

function obtenerIniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join('')
    .toUpperCase()
}

export function AvatarArtista({ artista }: AvatarArtistaProps) {
  return (
    <Link
      to={crearRuta.detalleArtista(artista.id)}
      aria-label={`Ver artista ${artista.stageName}`}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-700"
    >
      <span
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-800 group-hover:bg-violet-200 dark:bg-violet-950 dark:text-violet-200"
      >
        {obtenerIniciales(artista.stageName)}
      </span>
      <span>
        <strong className="block text-slate-950 dark:text-white">
          {artista.stageName}
        </strong>
        <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
          {artista.genre} · {artista.country}
        </span>
      </span>
    </Link>
  )
}
