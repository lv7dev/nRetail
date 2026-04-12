import type { ReactNode } from 'react';
import { Icon } from '@/components/ui';
import { cartItemCount, useCartStore } from '@/store/useCartStore';

function HeaderBadge({ value, testId }: { value?: number; testId: string }) {
  if (!value) {
    return null;
  }

  return (
    <span
      data-testid={testId}
      className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-content-inverse"
    >
      {value}
    </span>
  );
}

function HeaderActionButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center text-content-inverse"
    >
      {children}
    </button>
  );
}

export default function HeaderActions() {
  const count = useCartStore(cartItemCount);

  return (
    <div className="flex items-center gap-1">
      <HeaderActionButton label="Open cart">
        <Icon name="cart-shopping" size={20} />
        <HeaderBadge value={count} testId="cart-badge" />
      </HeaderActionButton>

      <HeaderActionButton label="Open notifications">
        <Icon name="bell" size={20} />
        <span
          data-testid="notification-badge"
          className="absolute -right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-destructive"
        />
      </HeaderActionButton>
    </div>
  );
}
