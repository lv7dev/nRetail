import { forwardRef, InputHTMLAttributes, useRef } from 'react';
import { Icon } from '@/components/ui/Icon/Icon';
import { cn } from '@/utils/cn';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, ...props }, forwardedRef) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const setRef = (el: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      if (typeof forwardedRef === 'function') forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    };

    const showClear = !!props.value && !!onClear;

    return (
      <div
        className={cn(
          'flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3',
          className,
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <button
          type="button"
          tabIndex={-1}
          onClick={() => inputRef.current?.focus()}
          className="shrink-0 text-content-muted"
        >
          <Icon name="magnifying-glass" size={20} />
        </button>
        <input
          ref={setRef}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-base text-content outline-none',
            'placeholder:text-content-muted disabled:cursor-not-allowed disabled:opacity-50',
          )}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="clear"
            onClick={onClear}
            className="shrink-0 text-content-muted"
          >
            <Icon name="xmark" size={16} />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
