import { forwardRef } from 'react';

// Minimal PasswordInput mock for jsdom integration tests.
// The real component imports SVG icons dynamically which fail in jsdom.
// This shim preserves the forwardRef + props-spread contract so form tests work correctly.
const MockPasswordInput = forwardRef(({ label, error, ...props }: any, ref: any) => (
  <div>
    {label && <label>{label}</label>}
    <input type="password" data-testid="password-input" ref={ref} {...props} />
    {error && <span>{error}</span>}
  </div>
));
MockPasswordInput.displayName = 'PasswordInput';

export { MockPasswordInput as PasswordInput };
