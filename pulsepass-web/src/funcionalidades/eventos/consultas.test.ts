import { describe, expect, it } from 'vitest'
import { clavesEventos } from './consultas'

describe('claves de caché de eventos', () => {
  it('crea la clave del catálogo publicado', () => {
    expect(clavesEventos.publicados()).toEqual([
      'eventos',
      'publicados',
    ])
  })

  it('crea una clave independiente para cada evento', () => {
    expect(clavesEventos.detalle('CMF-2026')).toEqual([
      'evento',
      'CMF-2026',
    ])
  })

  it('crea una clave independiente para el filtro de artista', () => {
    expect(clavesEventos.porArtista('Solar Beat')).toEqual([
      'eventos',
      'artista',
      'Solar Beat',
    ])
  })
})
