import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders a checkbox input', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('associates label with checkbox via htmlFor/id', () => {
    render(<Checkbox label="Accept terms" id="terms" />);
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'terms');
  });

  it('reflects checked state', () => {
    render(<Checkbox checked={true} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('reflects unchecked state', () => {
    render(<Checkbox checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('calls onChange when clicked', async () => {
    const handler = vi.fn();
    render(<Checkbox onChange={handler} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('does not call onChange when disabled', async () => {
    const handler = vi.fn();
    render(<Checkbox disabled checked={false} onChange={handler} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('forwards ref to the checkbox input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
  });

  it('checkbox input has dark mode border class', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox').className).toMatch(/dark:border-border-dark/);
  });

  it('label has dark mode class', () => {
    render(<Checkbox label="Accept" id="accept" />);
    expect(screen.getByText('Accept').className).toMatch(/dark:text-content-dark/);
  });
});
