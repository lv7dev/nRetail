import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon/Icon';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-content dark:text-content-dark">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            className={cn(
              'w-full rounded-md border bg-surface px-3 py-2 pr-10 text-sm text-content',
              'dark:bg-surface-dark dark:text-content-dark dark:border-border-dark',
              'placeholder:text-content-subtle dark:placeholder:text-content-dark-subtle',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-destructive' : 'border-border',
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content dark:text-content-dark-muted"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            <Icon name={visible ? 'eye' : 'eye-slash'} variant="regular" size={16} />
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
