import { cn } from '../../utils/cn'

const tones = {
  neutral: 'bg-ink-100 text-ink-700',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
}

export default function Badge({ tone = 'neutral', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
