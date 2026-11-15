import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  obtenerArtistaPorIdApi,
  obtenerArtistaPorNombreApi,
  obtenerArtistasActivosApi,
} from './api'

describe('API pública de artistas', () => {
  const fetchMock = vi.fn<typeof fetch>()

  const artista = {
    id: 20,
    stageName: 'Mar Azul',
    country: 'Colombia',
    genre: 'Pop',
    active: true,
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('obtiene los artistas activos', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([artista]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(obtenerArtistasActivosApi()).resolves.toEqual([artista])

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/artists/active',
      expect.any(Object),
    )
  })

  it('obtiene un artista por su identificador', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(artista), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(obtenerArtistaPorIdApi(20)).resolves.toEqual(artista)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/artists/20',
      expect.any(Object),
    )
  })

  it('codifica el nombre artístico en la consulta', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(artista), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await obtenerArtistaPorNombreApi('Mar Azul')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/artists/by-stage-name?stageName=Mar+Azul',
      expect.any(Object),
    )
  })

  it('rechaza identificadores inválidos antes de consultar', async () => {
    await expect(obtenerArtistaPorIdApi(0)).rejects.toBeDefined()

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
