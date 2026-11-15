import { Link } from 'react-router'
import { useArtistasActivos } from '../funcionalidades/artistas/consultas'
import { crearRuta } from '../lib/rutas'

export default function ListaArtistas() {
  const consulta = useArtistasActivos()

  if (consulta.isPending) {
    return (
      <section
        className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        aria-live="polite"
      >
        <p className="text-slate-600 dark:text-slate-300">Cargando artistas…</p>
      </section>
    )
  }

  if (consulta.isError) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
          Artistas
        </h1>
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          No fue posible cargar los artistas. Intenta nuevamente.
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold tracking-wider text-violet-600 uppercase">
        PulsePass
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
        Artistas
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
        Descubre los artistas que forman parte de nuestros eventos.
      </p>

      {consulta.data.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 p-6 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-300">
            No hay artistas activos disponibles en este momento.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {consulta.data.map((artista) => (
            <li
              key={artista.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="p-6">
                <p className="text-sm font-semibold text-violet-600">
                  {artista.genre}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                  {artista.stageName}
                </h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {artista.country}
                </p>

                <Link
                  to={crearRuta.detalleArtista(artista.id)}
                  className="mt-6 inline-flex rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                >
                  Ver artista
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
