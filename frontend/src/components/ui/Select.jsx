import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Select = forwardRef(({ label, error, className, children, ...props }, ref) => {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-800">{label}</span>
      )}
      <select
        ref={ref}
        className={cn(
          'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-900',
          error ? 'border-red-400' : 'border-ink-200',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
})

Select.displayName = 'Select'
export default Select
