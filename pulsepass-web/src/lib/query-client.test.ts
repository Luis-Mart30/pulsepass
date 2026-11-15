import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './http'
import { clavesArtistas } from '../funcionalidades/artistas/consultas'
import { clavesEventos } from '../funcionalidades/eventos/consultas'
import { clavesSedes } from '../funcionalidades/sedes/consultas'
import { clavesTickets } from '../funcionalidades/tickets/consultas'
import { clavesUsuarios } from '../funcionalidades/usuarios/consultas'
import {
  debeReintentarConsulta,
  queryClient,
  TIEMPOS_CACHE,
} from './query-client'

function crearClienteDePrueba() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: debeReintentarConsulta,
        retryDelay: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

describe('política de reintentos de React Query', () => {
  it.each([400, 401, 403, 404, 409])(
    'no reintenta respuestas HTTP %i',
    (estado) => {
      expect(
        debeReintentarConsulta(0, new ApiError(estado, 'Error de cliente')),
      ).toBe(false)
    },
  )

  it.each([0, 500, 502, 503])(
    'reintenta una sola vez el estado %i',
    (estado) => {
      const error = new ApiError(estado, 'Error recuperable')

      expect(debeReintentarConsulta(0, error)).toBe(true)
      expect(debeReintentarConsulta(1, error)).toBe(false)
    },
  )

  it('reintenta una sola vez un error inesperado', () => {
    const error = new Error('Fallo inesperado')

    expect(debeReintentarConsulta(0, error)).toBe(true)
    expect(debeReintentarConsulta(1, error)).toBe(false)
  })

  it('realiza una sola petición cuando recibe un 404', async () => {
    const cliente = crearClienteDePrueba()
    const consulta = vi
      .fn()
      .mockRejectedValue(new ApiError(404, 'No encontrado'))

    await expect(
      cliente.fetchQuery({
        queryKey: ['prueba', '404'],
        queryFn: consulta,
      }),
    ).rejects.toMatchObject({ status: 404 })

    expect(consulta).toHaveBeenCalledOnce()
    cliente.clear()
  })

  it('realiza dos peticiones cuando el servidor responde 500', async () => {
    const cliente = crearClienteDePrueba()
    const consulta = vi
      .fn()
      .mockRejectedValue(new ApiError(500, 'Error del servidor'))

    await expect(
      cliente.fetchQuery({
        queryKey: ['prueba', '500'],
        queryFn: consulta,
      }),
    ).rejects.toMatchObject({ status: 500 })

    expect(consulta).toHaveBeenCalledTimes(2)
    cliente.clear()
  })

  it('mantiene desactivados los reintentos de mutaciones', () => {
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false)
  })
})

describe('convenciones de caché del PRD', () => {
  it('define los tiempos de frescura requeridos', () => {
    expect(TIEMPOS_CACHE).toEqual({
      eventosPublicados: 60_000,
      evento: 30_000,
      eventosPorArtista: 60_000,
      artistas: 300_000,
      sedes: 300_000,
      usuario: 60_000,
      tickets: 15_000,
    })
  })

  it('genera las claves de detalle y colecciones esperadas', () => {
    expect(clavesEventos.publicados()).toEqual(['eventos', 'publicados'])
    expect(clavesEventos.detalle('EVT-01')).toEqual(['evento', 'EVT-01'])
    expect(clavesEventos.porArtista('Solar Beat')).toEqual([
      'eventos',
      'artista',
      'Solar Beat',
    ])
    expect(clavesArtistas.activos()).toEqual(['artistas', 'activos'])
    expect(clavesArtistas.detalle(20)).toEqual(['artista', 20])
    expect(clavesSedes.activas()).toEqual(['sedes', 'activas'])
    expect(clavesSedes.detalle('VEN-01')).toEqual(['sede', 'VEN-01'])
    expect(clavesUsuarios.porEmail('user@pulsepass.test')).toEqual([
      'usuario',
      'user@pulsepass.test',
    ])
    expect(clavesTickets.porUsuario('user@pulsepass.test')).toEqual([
      'tickets',
      'usuario',
      'user@pulsepass.test',
    ])
    expect(clavesTickets.detalle('TKT-01')).toEqual(['ticket', 'TKT-01'])
    expect(clavesTickets.pagadosEvento('EVT-01')).toEqual([
      'tickets',
      'pagados',
      'EVT-01',
    ])
  })
})
