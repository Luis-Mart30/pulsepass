interface PaginaTemporalProps {
  titulo: string
}

export function PaginaTemporal({
  titulo,
}: PaginaTemporalProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-violet-600">
        PulsePass
      </p>
      <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
        {titulo}
      </h1>
      <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
        Esta pantalla está conectada al sistema de rutas y será
        implementada con el diseño y comportamiento definidos en el
        PRD.
      </p>
    </section>
  )
}