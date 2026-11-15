import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react'
import clsx from 'clsx'

const SELECTOR_ENFOCABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

interface ModalProps {
  abierto: boolean
  titulo: string
  children: ReactNode
  onCerrar: () => void
  bloquearCierre?: boolean
  descripcionId?: string
  className?: string
}

export function Modal({
  abierto,
  titulo,
  children,
  onCerrar,
  bloquearCierre = false,
  descripcionId,
  className,
}: ModalProps) {
  const tituloId = useId()
  const dialogoRef = useRef<HTMLElement>(null)
  const onCerrarRef = useRef(onCerrar)
  const bloquearCierreRef = useRef(bloquearCierre)

  useEffect(() => {
    onCerrarRef.current = onCerrar
    bloquearCierreRef.current = bloquearCierre
  }, [bloquearCierre, onCerrar])

  useEffect(() => {
    if (!abierto) return

    const elementoAnterior = document.activeElement
    const dialogo = dialogoRef.current
    const obtenerEnfocables = (): HTMLElement[] =>
      dialogo === null
        ? []
        : Array.from(
            dialogo.querySelectorAll<HTMLElement>(
              SELECTOR_ENFOCABLE,
            ),
          )

    const enfocables = obtenerEnfocables()
    const objetivoInicial = enfocables[0] ?? dialogo
    objetivoInicial?.focus()

    const manejarTeclado = (evento: KeyboardEvent): void => {
      if (
        evento.key === 'Escape' &&
        !bloquearCierreRef.current
      ) {
        evento.preventDefault()
        onCerrarRef.current()
        return
      }

      if (evento.key !== 'Tab') return

      const elementos = obtenerEnfocables()
      if (elementos.length === 0) {
        evento.preventDefault()
        dialogo?.focus()
        return
      }

      const primero = elementos[0]
      const ultimo = elementos.at(-1)

      if (
        evento.shiftKey &&
        (document.activeElement === primero ||
          document.activeElement === dialogo)
      ) {
        evento.preventDefault()
        ultimo?.focus()
      } else if (
        !evento.shiftKey &&
        document.activeElement === ultimo
      ) {
        evento.preventDefault()
        primero?.focus()
      }
    }

    document.addEventListener('keydown', manejarTeclado)
    const desbordamientoAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', manejarTeclado)
      document.body.style.overflow = desbordamientoAnterior
      if (elementoAnterior instanceof HTMLElement) {
        elementoAnterior.focus()
      }
    }
  }, [abierto])

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      role="presentation"
      onMouseDown={(evento) => {
        if (
          evento.target === evento.currentTarget &&
          !bloquearCierre
        ) {
          onCerrar()
        }
      }}
    >
      <section
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descripcionId}
        tabIndex={-1}
        className={clsx(
          'w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-none dark:border-slate-700 dark:bg-slate-900',
          className,
        )}
      >
        <h2
          id={tituloId}
          className="text-xl font-bold text-slate-950 dark:text-white"
        >
          {titulo}
        </h2>
        {children}
      </section>
    </div>
  )
}
