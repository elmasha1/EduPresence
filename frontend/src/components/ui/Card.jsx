import { cn } from '../../utils/cn'

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-ink-200 bg-white shadow-soft',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
