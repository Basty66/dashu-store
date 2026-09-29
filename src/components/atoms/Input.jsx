const control =
  'block w-full rounded-xl border bg-white px-4 text-[0.95rem] text-ink placeholder:text-muted/60 ' +
  'transition-colors duration-200 ease-out focus:border-ink focus:outline-none focus:ring-4 focus:ring-gold/20 ' +
  'disabled:cursor-not-allowed disabled:bg-bone disabled:text-muted'

const state = (invalid) => (invalid ? 'border-danger/70' : 'border-sand-300 hover:border-ink/30')

export function Input({ invalid, className = '', ref, ...props }) {
  return <input ref={ref} className={`${control} h-12 ${state(invalid)} ${className}`} aria-invalid={invalid || undefined} {...props} />
}

export function Select({ invalid, className = '', children, ...props }) {
  return (
    <select
      className={`${control} h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%230B1220' stroke-width='1.6'%3E%3Cpath d='m3 4.5 3 3 3-3'/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10 ${state(invalid)} ${className}`}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ invalid, className = '', ...props }) {
  return <textarea className={`${control} min-h-[112px] resize-y py-3 ${state(invalid)} ${className}`} aria-invalid={invalid || undefined} {...props} />
}
