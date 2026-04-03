interface BrandItemProps {
  name: string;
}

function BrandItem({ name }: BrandItemProps) {
  return (
    <li className="flex shrink-0 flex-col items-center gap-1">
      <div
        data-testid="brand-logo"
        className="flex h-[124px] w-[124px] items-center justify-center rounded-xl bg-surface shadow-sm"
      />
      <span className="text-sm font-medium text-content">{name}</span>
    </li>
  );
}

const BRANDS = ['CHILL', 'SPECIAL', 'LAGER'];

export default function BrandSection() {
  return (
    <div className="overflow-x-auto pb-2">
      <ul className="flex gap-3 pt-3">
        {BRANDS.map((name) => (
          <BrandItem key={name} name={name} />
        ))}
      </ul>
    </div>
  );
}
