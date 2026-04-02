interface BrandChipProps {
  name: string;
  initials: string;
  bgColor: string;
}

function BrandChip({ name, initials, bgColor }: BrandChipProps) {
  return (
    <li className="flex flex-shrink-0 flex-col items-center gap-1">
      <div
        aria-hidden="true"
        className={`flex h-12 w-12 items-center justify-center rounded-full ${bgColor} text-sm font-bold text-white`}
      >
        {initials}
      </div>
      <span className="text-xs text-content">{name}</span>
    </li>
  );
}

const BRANDS: BrandChipProps[] = [
  { name: '333', initials: '333', bgColor: 'bg-amber-600' },
  { name: 'BIA SAIGON', initials: 'BS', bgColor: 'bg-primary' },
  { name: 'BIA LẠC VIỆT', initials: 'LV', bgColor: 'bg-emerald-600' },
];

export default function BrandSection() {
  return (
    <div className="overflow-x-auto pb-2">
      <ul className="flex gap-4 pt-3">
        {BRANDS.map((brand) => (
          <BrandChip
            key={brand.name}
            name={brand.name}
            initials={brand.initials}
            bgColor={brand.bgColor}
          />
        ))}
      </ul>
    </div>
  );
}
