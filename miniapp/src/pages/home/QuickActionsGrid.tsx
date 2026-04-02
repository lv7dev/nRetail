import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui';

interface QuickAction {
  key: string;
  icon: string;
  labelKey: string;
}

interface QuickActionsGridProps {
  onAction?: (key: string) => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  { key: 'outletManagement', icon: 'store', labelKey: 'quickActions.outletManagement' },
  { key: 'suggestedOrder', icon: 'cart-shopping', labelKey: 'quickActions.suggestedOrder' },
  { key: 'tradePrograms', icon: 'tag', labelKey: 'quickActions.tradePrograms' },
  { key: 'orderHistory', icon: 'clock-rotate-left', labelKey: 'quickActions.orderHistory' },
];

export default function QuickActionsGrid({ onAction }: QuickActionsGridProps) {
  const { t } = useTranslation('home');

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.key}
          onClick={() => onAction?.(action.key)}
          className="flex flex-col items-center gap-1 rounded-lg bg-white/10 p-2 text-center"
        >
          <Icon name={action.icon} size={24} className="text-content-inverse" />
          <span className="text-content-inverse text-xs leading-tight">{t(action.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}
