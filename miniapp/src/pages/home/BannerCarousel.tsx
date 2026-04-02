import { cn } from '@/utils/cn';

interface BannerCarouselProps {
  alt: string;
  className?: string;
}

export default function BannerCarousel({ alt, className }: BannerCarouselProps) {
  return (
    <div
      className={cn('relative flex h-36 w-full items-center justify-center bg-primary/20', className)}
      role="img"
      aria-label={alt}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-primary"
          aria-hidden="true"
        >
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
      </div>
    </div>
  );
}
