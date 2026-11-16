import { Link } from 'react-router'
import type { Artista } from '../../funcionalidades/artistas/tipos'
import { crearRuta } from '../../lib/rutas'
import { InicialesArtista } from './InicialesArtista'
import './Artistas.css'

interface AvatarArtistaProps {
  artista: Artista
  variante?: 'compacta' | 'tarjeta'
}

export function AvatarArtista({
  artista,
  variante = 'compacta',
}: AvatarArtistaProps) {
  return (
    <Link
      to={crearRuta.detalleArtista(artista.id)}
      aria-label={`Ver artista ${artista.stageName}`}
      className="artista-enlace"
      data-variante={variante}
      data-acento={artista.id % 4}
    >
      <span className="artista-arte" aria-hidden="true">
        <InicialesArtista
          nombre={artista.stageName}
          className="artista-disco"
        />
      </span>
      <div className="artista-informacion">
        {variante === 'tarjeta' ? (
          <h2 className="artista-nombre">{artista.stageName}</h2>
        ) : (
          <strong className="artista-nombre">{artista.stageName}</strong>
        )}
        <p className="artista-datos">
          <span className="artista-genero">{artista.genre}</span>
          <span>{artista.country}</span>
        </p>
      </div>
      <span className="artista-accion" aria-hidden="true">
        {variante === 'tarjeta' ? 'Ver artista' : null}
      </span>
    </Link>
  )
}
