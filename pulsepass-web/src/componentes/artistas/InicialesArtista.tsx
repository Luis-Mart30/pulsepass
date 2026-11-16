import clsx from 'clsx'

interface InicialesArtistaProps {
  nombre: string
  className?: string
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

export function InicialesArtista({ nombre, className }: InicialesArtistaProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full font-bold',
        className,
      )}
    >
      {obtenerIniciales(nombre)}
    </span>
  )
}
