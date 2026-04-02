import { Icon } from '@/components/ui';

interface AccountProfileHeaderProps {
  outletName: string;
  phone: string;
  className?: string;
}

export default function AccountProfileHeader({
  outletName,
  phone,
}: AccountProfileHeaderProps) {
  return (
    <div className="bg-primary px-4 pt-4 pb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
          <Icon name="globe" size={24} className="text-primary" />
        </div>
        <div>
          <p className="text-content-inverse font-bold text-base">{outletName}</p>
          <p className="text-content-inverse/70 text-sm">{phone}</p>
        </div>
      </div>
    </div>
  );
}
