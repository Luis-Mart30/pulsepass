import { describe, expect, it } from 'vitest'
import { crearRuta, RUTAS } from './rutas'

describe('rutas de PulsePass', () => {
  it('contiene las veinte rutas exigidas', () => {
    expect(Object.keys(RUTAS)).toHaveLength(20)
  })

  it('construye y codifica las rutas con parámetros', () => {
    expect(crearRuta.detalleEvento('EVT 001')).toBe('/eventos/EVT%20001')
    expect(crearRuta.detalleArtista(20)).toBe('/artistas/20')
    expect(crearRuta.detalleTicket('TCK/001')).toBe(
      '/mis-tickets/TCK%2F001',
    )
  })
})