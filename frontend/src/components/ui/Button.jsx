import { cn } from '../../utils/cn'
import Spinner from './Spinner'

const variants = {
  primary: 'bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-ink-900',
  secondary: 'bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 focus-visible:ring-ink-300',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100 focus-visible:ring-ink-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" className={variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-ink-700'} />}
      {children}
    </button>
  )
}
