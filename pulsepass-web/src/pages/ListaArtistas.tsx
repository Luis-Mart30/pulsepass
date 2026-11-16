import { IlustracionSeccion } from '../componentes/IlustracionSeccion'
import { AvatarArtista } from '../componentes/artistas/AvatarArtista'
import { useArtistasActivos } from '../funcionalidades/artistas/consultas'

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
        <h1 className="font-titulo text-3xl font-extrabold text-slate-950 dark:text-white">
          Artistas
        </h1>
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          No fue posible cargar los artistas. Intenta nuevamente.
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="portada-seccion portada-artistas">
        <div>
          <h1 className="font-titulo text-3xl font-extrabold tracking-tight text-[#241044] sm:text-4xl lg:text-5xl dark:text-slate-100">
            Artistas
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Descubre los artistas que forman parte de nuestros eventos.
          </p>
        </div>
        <IlustracionSeccion tipo="artistas" />
      </header>

      {consulta.data.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50/60 p-6 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-300">
            No hay artistas activos disponibles en este momento.
          </p>
        </div>
      ) : (
        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {consulta.data.map((artista) => (
            <li key={artista.id} className="min-w-0">
              <AvatarArtista artista={artista} variante="tarjeta" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
