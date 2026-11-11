import type { CategoriaEvento } from '../funcionalidades/eventos/tipos'

const etiquetasCategoria: Record<
  CategoriaEvento,
  string
> = {
  MUSIC: 'Música',
  SPORTS: 'Deportes',
  TECHNOLOGY: 'Tecnología',
  EDUCATION: 'Educación',
  CULTURE: 'Cultura',
  ENTERTAINMENT: 'Entretenimiento',
}

export function obtenerEtiquetaCategoria(
  categoria: CategoriaEvento,
): string {
  return etiquetasCategoria[categoria]
}

export function formatearFechaEvento(
  fecha: string,
): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(fecha))
}