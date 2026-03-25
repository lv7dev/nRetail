import { useEffect, useState, ComponentType, SVGProps } from 'react'
import { cn } from '@/utils/cn'

export type IconVariant = 'solid' | 'regular' | 'light' | 'thin' | 'brands'

export interface IconProps {
  name: string
  variant?: IconVariant
  size?: number
  className?: string
}

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>

export function Icon({ name, variant = 'regular', size = 16, className }: IconProps) {
  const [SvgIcon, setSvgIcon] = useState<SvgComponent | null>(null)

  useEffect(() => {
    let cancelled = false
    import(`@/assets/icons/${variant}/${name}.svg?react`).then((mod) => {
      if (!cancelled) setSvgIcon(() => mod.default as SvgComponent)
    }).catch(() => {
      if (!cancelled) setSvgIcon(null)
    })
    return () => { cancelled = true }
  }, [name, variant])

  if (!SvgIcon) return null

  return (
    <SvgIcon
      width={size}
      height={size}
      className={cn('inline-block', className)}
    />
  )
}
