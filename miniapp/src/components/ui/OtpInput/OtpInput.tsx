import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';
import { cn } from '@/utils/cn';

export interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  className?: string;
}

export function OtpInput({ length = 6, onComplete, className }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const values = useRef<string[]>(Array(length).fill(''));

  const notifyIfComplete = () => {
    const code = values.current.join('');
    if (code.length === length && /^\d+$/.test(code)) {
      onComplete(code);
    }
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    e.target.value = digit;
    values.current[index] = digit;
    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
    notifyIfComplete();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values.current[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      values.current[index - 1] = '';
      /* v8 ignore next */
      if (inputs.current[index - 1]) inputs.current[index - 1]!.value = '';
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!digits) return;
    digits.split('').forEach((d, i) => {
      values.current[i] = d;
      /* v8 ignore next */
      if (inputs.current[i]) inputs.current[i]!.value = d;
    });
    // fill remaining with empty
    for (let i = digits.length; i < length; i++) {
      values.current[i] = '';
      /* v8 ignore next */
      if (inputs.current[i]) inputs.current[i]!.value = '';
    }
    inputs.current[Math.min(digits.length, length - 1)]?.focus();
    notifyIfComplete();
  };

  return (
    <div className={cn('flex gap-2', className)}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={cn(
            'w-10 h-12 rounded-md border border-border bg-surface text-center text-lg font-semibold text-content',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
          )}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
