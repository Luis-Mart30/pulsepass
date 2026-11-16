import { Link, useParams } from 'react-router'
import { IlustracionSeccion } from '../componentes/IlustracionSeccion'
import { InicialesArtista } from '../componentes/artistas/InicialesArtista'
import '../componentes/artistas/Artistas.css'
import { Boton } from '../componentes/Boton'
import { TarjetaEvento } from '../componentes/eventos/TarjetaEvento'
import { useArtistaPorId } from '../funcionalidades/artistas/consultas'
import { useEventosPorArtista } from '../funcionalidades/eventos/consultas'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export default function DetalleArtista() {
  const { id: idParametro } = useParams<{ id: string }>()
  const idConvertido = Number(idParametro)
  const id =
    Number.isInteger(idConvertido) && idConvertido > 0 ? idConvertido : null

  const consulta = useArtistaPorId(id)
  const consultaEventos = useEventosPorArtista(consulta.data?.stageName ?? '')

  if (id === null) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-titulo text-3xl font-extrabold text-slate-950 dark:text-white">
          Artista no encontrado
        </h1>
        <p role="alert" className="mt-4 text-slate-600 dark:text-slate-300">
          El identificador del artista no es válido.
        </p>
        <Link
          to={RUTAS.ARTISTAS}
          className="mt-6 inline-flex font-semibold text-violet-600 hover:text-violet-700"
        >
          Volver a artistas
        </Link>
      </section>
    )
  }

  if (consulta.isPending) {
    return (
      <section
        className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8"
        aria-live="polite"
      >
        <p className="text-slate-600 dark:text-slate-300">
          Cargando información del artista…
        </p>
      </section>
    )
  }

  if (consulta.isError) {
    const noEncontrado =
      consulta.error instanceof ApiError && consulta.error.status === 404

    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-titulo text-3xl font-extrabold text-slate-950 dark:text-white">
          {noEncontrado
            ? 'Artista no encontrado'
            : 'No pudimos cargar el artista'}
        </h1>
        <p role="alert" className="mt-4 text-slate-600 dark:text-slate-300">
          {noEncontrado
            ? 'El artista solicitado no existe o ya no está disponible.'
            : 'Ocurrió un problema al consultar la información. Intenta nuevamente.'}
        </p>
        <Link
          to={RUTAS.ARTISTAS}
          className="mt-6 inline-flex font-semibold text-violet-600 hover:text-violet-700"
        >
          Volver a artistas
        </Link>
      </section>
    )
  }

  const artista = consulta.data

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to={RUTAS.ARTISTAS}
        className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-600 dark:text-violet-300 dark:hover:bg-slate-900"
      >
        ← Volver a artistas
      </Link>

      <article className="tarjeta-operacion mt-4 overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="artista-perfil" data-acento={artista.id % 4}>
          <div className="portada-ficha flex flex-wrap items-center gap-4 p-5 sm:gap-6 sm:p-8">
            <InicialesArtista
              nombre={artista.stageName}
              className="artista-disco"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                  {artista.genre}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    artista.active
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {artista.active ? 'Activo' : 'No disponible'}
                </span>
              </div>

              <h1 className="font-titulo mt-3 text-3xl font-extrabold tracking-tight break-words text-[#241044] sm:text-4xl dark:text-white">
                {artista.stageName}
              </h1>
            </div>
            <IlustracionSeccion tipo="artistas" />
          </div>

          <dl className="artista-perfil-datos grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 rounded-xl border border-violet-100 bg-violet-50/60 p-4 dark:border-slate-700 dark:bg-slate-950">
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                País
              </dt>
              <dd className="mt-1 font-semibold break-words text-slate-950 dark:text-white">
                {artista.country}
              </dd>
            </div>

            <div className="min-w-0 rounded-xl border border-violet-100 bg-violet-50/60 p-4 dark:border-slate-700 dark:bg-slate-950">
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Género musical
              </dt>
              <dd className="mt-1 font-semibold break-words text-slate-950 dark:text-white">
                {artista.genre}
              </dd>
            </div>
          </dl>
        </div>
      </article>

      <section className="mt-8" aria-labelledby="eventos-del-artista">
        <h2
          id="eventos-del-artista"
          className="font-titulo border-l-4 border-violet-700 pl-3 text-2xl font-extrabold text-[#241044] dark:border-violet-400 dark:text-white"
        >
          Próximos eventos de {artista.stageName}
        </h2>

        {consultaEventos.isPending ? (
          <p role="status" className="mt-4 text-slate-600 dark:text-slate-300">
            Cargando eventos…
          </p>
        ) : null}

        {consultaEventos.isError ? (
          <div className="mt-4 text-slate-600 dark:text-slate-300">
            <p role="alert">No fue posible cargar los eventos del artista.</p>
            <Boton
              type="button"
              variante="secundario"
              className="mt-4"
              onClick={() => void consultaEventos.refetch()}
            >
              Reintentar
            </Boton>
          </div>
        ) : null}

        {consultaEventos.isSuccess &&
          (consultaEventos.data.length === 0 ? (
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Este artista aún no tiene eventos publicados.
            </p>
          ) : (
            <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {consultaEventos.data.map((evento) => (
                <li key={evento.id}>
                  <TarjetaEvento evento={evento} />
                </li>
              ))}
            </ul>
          ))}
      </section>
    </section>
  )
}
