import { cn } from '@/utils/cn'

export type AlertVariant = 'error' | 'success' | 'info'

export interface AlertProps {
  message: string
  variant?: AlertVariant
  className?: string
}

const variantClasses: Record<AlertVariant, string> = {
  error: 'bg-destructive/10 text-destructive border border-destructive/20',
  success: 'bg-success/10 text-success border border-success/20',
  info: 'bg-primary/10 text-primary border border-primary/20',
}

export function Alert({ message, variant = 'error', className }: AlertProps) {
  if (!message) return null
  return (
    <div
      role="alert"
      className={cn(
        'rounded-md px-3 py-2 text-sm',
        variantClasses[variant],
        className,
      )}
    >
      {message}
    </div>
  )
}
