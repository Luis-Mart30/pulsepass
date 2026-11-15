import {
  forwardRef,
  type ComponentPropsWithoutRef,
} from 'react'
import clsx from 'clsx'

interface CampoProps
  extends ComponentPropsWithoutRef<'input'> {
  etiqueta: string
  error?: string | undefined
}

export const Campo = forwardRef<HTMLInputElement, CampoProps>(
  function Campo(
    {
      etiqueta,
      error,
      id,
      className,
      ...propiedades
    },
    ref,
  ) {
    const errorId =
      error !== undefined && id !== undefined
        ? `${id}-error`
        : undefined

    return (
      <div className="space-y-1.5">
        <label
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          htmlFor={id}
        >
          {etiqueta}
        </label>

        <input
          {...propiedades}
          ref={ref}
          id={id}
          aria-describedby={errorId}
          aria-invalid={error !== undefined}
          className={clsx(
            'min-h-11 w-full rounded-lg border bg-white px-3 py-2',
            'text-slate-900 outline-none transition',
            'placeholder:text-slate-400',
            'focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100',
            'dark:bg-slate-950 dark:text-slate-100',
            error === undefined
              ? 'border-slate-300 dark:border-slate-700'
              : 'border-red-500 focus:border-red-600 focus:ring-red-100',
            className,
          )}
        />

        {error !== undefined ? (
          <p
            id={errorId}
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)