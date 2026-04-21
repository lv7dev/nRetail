import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/components/ui';
import type { Outlet } from '@/types/outlet';

interface OutletItemProps {
  outlet: Outlet;
  connected: boolean;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function OutletItem({ outlet, connected }: OutletItemProps) {
  const { t } = useTranslation('outlets');

  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-sm dark:border-border-dark dark:bg-surface-dark">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
        {outlet.imageUrl ? (
          <img src={outlet.imageUrl} alt={outlet.name} className="h-full w-full object-cover" />
        ) : (
          <span>{getInitials(outlet.name)}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-content dark:text-content-dark">
              {outlet.name}
            </p>
            {outlet.code && (
              <p className="mt-1 text-xs text-content-muted dark:text-content-dark-muted">
                {outlet.code}
              </p>
            )}
          </div>

          {!connected && (
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-warning-foreground dark:text-warning">
                {t('outlets.notMyOutlet')}
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-2"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                {t('outlets.connect')}
              </Button>
            </div>
          )}
        </div>

        {outlet.address && (
          <div className="mt-2 flex items-start gap-2 text-xs text-content-muted dark:text-content-dark-muted">
            <Icon name="location-dot" size={14} className="mt-0.5 shrink-0" />
            <span className="line-clamp-2">{outlet.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
