import clsx from 'clsx'

interface IconoSedeProps {
  className: string
}

export function IconoSede({ className }: IconoSedeProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'grid shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        className="w-1/2"
      >
        <path d="M20 10c0 5-8 10-8 10s-8-5-8-10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    </span>
  )
}
