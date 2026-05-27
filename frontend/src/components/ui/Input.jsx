import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-800">{label}</span>
      )}
      <input
        ref={ref}
        className={cn(
          'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 shadow-sm',
          'placeholder:text-ink-500',
          'focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-900',
          'disabled:bg-ink-50 disabled:cursor-not-allowed',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-ink-200',
          className
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
})

Input.displayName = 'Input'
export default Input
