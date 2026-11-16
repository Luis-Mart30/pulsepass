import './IconoDato.css'

const TRAZOS = {
  fecha:
    'M7 3v4m10-4v4M4 10h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  lugar:
    'M20 10c0 5-8 10-8 10s-8-5-8-10a8 8 0 1 1 16 0ZM14.5 10a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z',
  edad: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  entrada: 'M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6Zm11 2v2m0 4v2',
  precio: 'M3 5h8l10 10-6 6L3 9V5Zm4 3h.01',
  codigo: 'M5 9h14M4 15h14M10 3 8 21m7-18-2 18',
}

export function IconoDato({ tipo }: { tipo: keyof typeof TRAZOS }) {
  return (
    <svg
      className="icono-dato"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={TRAZOS[tipo]} />
    </svg>
  )
}
