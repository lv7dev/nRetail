interface PromotionCardProps {
  title: string;
  colorClass: string;
}

function PromotionCard({ title, colorClass }: PromotionCardProps) {
  return (
    <article
      className={`flex h-28 w-48 flex-shrink-0 flex-col justify-end rounded-lg p-3 ${colorClass}`}
    >
      <span className="text-sm font-semibold text-white">{title}</span>
    </article>
  );
}

const PLACEHOLDER_PROMOTIONS: PromotionCardProps[] = [
  { title: 'Khuyến mãi hè 2024', colorClass: 'bg-primary' },
  { title: 'Ưu đãi cuối tuần', colorClass: 'bg-amber-500' },
  { title: 'Giảm giá đặc biệt', colorClass: 'bg-emerald-500' },
];

export default function PromotionSection() {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 pt-3">
        {PLACEHOLDER_PROMOTIONS.map((promo) => (
          <PromotionCard key={promo.title} title={promo.title} colorClass={promo.colorClass} />
        ))}
      </div>
    </div>
  );
}
