const PROMOTION_COUNT = 3;

export default function PromotionSection() {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 pt-3">
        {Array.from({ length: PROMOTION_COUNT }).map((_, i) => (
          <article
            key={i}
            className="h-48 w-72 shrink-0 rounded-xl bg-surface-muted"
            aria-label={`Promotion ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
