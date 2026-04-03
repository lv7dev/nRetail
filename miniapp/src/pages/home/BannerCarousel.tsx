import { cn } from '@/utils/cn';

interface BannerCarouselProps {
  alt: string;
  className?: string;
  totalSlides?: number;
  activeSlide?: number;
}

export default function BannerCarousel({
  alt,
  className,
  totalSlides = 6,
  activeSlide = 1,
}: BannerCarouselProps) {
  return (
    <div
      className={cn('relative h-40 w-full overflow-hidden rounded-xl bg-surface-muted', className)}
      role="img"
      aria-label={alt}
    >
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <span
            key={i}
            data-testid="banner-dot"
            className={cn(
              'h-2 w-2 rounded-full',
              i === activeSlide ? 'bg-destructive' : 'bg-surface opacity-60',
            )}
          />
        ))}
      </div>
    </div>
  );
}
