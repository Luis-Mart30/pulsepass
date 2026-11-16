import type { Key, ReactNode } from 'react'

interface Columna<Fila> {
  titulo: string
  contenido: (fila: Fila) => ReactNode
}

interface TablaProps<Fila> {
  etiqueta: string
  filas: readonly Fila[]
  columnas: readonly Columna<Fila>[]
  claveFila: (fila: Fila) => Key
}

export function Tabla<Fila>({
  etiqueta,
  filas,
  columnas,
  claveFila,
}: TablaProps<Fila>) {
  return (
    <table className="w-full table-fixed text-left text-sm text-slate-700 dark:text-slate-200">
      <caption className="sr-only">{etiqueta}</caption>
      <thead className="bg-violet-100/70 text-violet-950 dark:bg-slate-800 dark:text-white">
        <tr>
          {columnas.map(({ titulo }) => (
            <th key={titulo} scope="col" className="px-3 py-3 font-semibold">
              {titulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
        {filas.map((fila) => (
          <tr
            key={claveFila(fila)}
            className="even:bg-violet-50/50 dark:even:bg-slate-800/30"
          >
            {columnas.map(({ titulo, contenido }) => (
              <td key={titulo} className="px-3 py-3 wrap-anywhere">
                {contenido(fila)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
