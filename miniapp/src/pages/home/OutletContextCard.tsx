import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui';
import { useOutletStore } from '@/store/useOutletStore';

interface QuickAction {
  key: string;
  icon: string;
  labelKey: string;
}

export interface OutletContextCardProps {
  collapsed?: boolean;
  onAction?: (key: string) => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  { key: 'outletManagement', icon: 'store', labelKey: 'quickActions.outletManagement' },
  { key: 'suggestedOrder', icon: 'cart-shopping', labelKey: 'quickActions.suggestedOrder' },
  { key: 'tradePrograms', icon: 'tag', labelKey: 'quickActions.tradePrograms' },
  { key: 'orderHistory', icon: 'clock-rotate-left', labelKey: 'quickActions.orderHistory' },
];

export default function OutletContextCard({ collapsed = false, onAction }: OutletContextCardProps) {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const selectedOutlet = useOutletStore((s) => s.selectedOutlet);

  return (
    <div className="rounded-xl bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => navigate('/outlets')}
        className="flex w-full items-center gap-3 px-3 py-3"
      >
        <Icon name="store" size={24} className="shrink-0 text-content-muted" />
        <span className="flex-1 text-left text-sm font-medium text-content">
          {selectedOutlet?.name}
        </span>
        <Icon name="chevron-right" size={16} className="text-content-muted" />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: collapsed ? '0fr' : '1fr' }}
      >
        <div className="overflow-hidden">
          <div className="h-px bg-border" />
          <div className="grid grid-cols-4 gap-1 p-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={() => onAction?.(action.key)}
                className="flex flex-col items-center gap-1 rounded-lg p-2 text-center"
              >
                <Icon name={action.icon} size={24} className="text-primary" />
                <span className="text-xs leading-tight text-content-muted">
                  {t(action.labelKey)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
