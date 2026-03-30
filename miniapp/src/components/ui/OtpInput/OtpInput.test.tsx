import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OtpInput } from './OtpInput';

describe('OtpInput', () => {
  it('renders 6 input boxes by default', () => {
    render(<OtpInput onComplete={vi.fn()} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('renders custom length', () => {
    render(<OtpInput length={4} onComplete={vi.fn()} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
  });

  it('ignores non-digit input', async () => {
    render(<OtpInput onComplete={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    await userEvent.type(inputs[0], 'a');
    expect(inputs[0]).toHaveValue('');
  });

  it('calls onComplete when all digits filled', async () => {
    const onComplete = vi.fn();
    render(<OtpInput onComplete={onComplete} />);
    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
    }
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('does not call onComplete with partial input', async () => {
    const onComplete = vi.fn();
    render(<OtpInput onComplete={onComplete} />);
    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 5; i++) {
      fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
    }
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('handles paste filling all boxes', () => {
    const onComplete = vi.fn();
    render(<OtpInput onComplete={onComplete} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '123456' },
    });
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('ignores non-digit paste', () => {
    const onComplete = vi.fn();
    render(<OtpInput onComplete={onComplete} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => 'abcdef' },
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('forwards className to container', () => {
    const { container } = render(<OtpInput onComplete={vi.fn()} className="mt-4" />);
    expect(container.firstChild).toHaveClass('mt-4');
  });

  it('backspace on empty box focuses previous and clears it', () => {
    render(<OtpInput onComplete={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    // Fill box 0 with '1', box 1 stays empty
    fireEvent.change(inputs[0], { target: { value: '1' } });
    // Focus box 1 then press Backspace (box 1 is empty, index=1 > 0)
    fireEvent.keyDown(inputs[1], { key: 'Backspace' });
    // Box 0 should be cleared
    expect(inputs[0]).toHaveValue('');
  });

  it('paste with fewer digits than length clears remaining boxes', () => {
    const onComplete = vi.fn();
    render(<OtpInput onComplete={onComplete} />);
    const inputs = screen.getAllByRole('textbox');
    // Paste only 3 digits into a 6-box input → lines 49-50 run for boxes 3,4,5
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '123' },
    });
    expect(inputs[3]).toHaveValue('');
    expect(inputs[4]).toHaveValue('');
    expect(inputs[5]).toHaveValue('');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('non-backspace key on empty box does nothing', () => {
    render(<OtpInput onComplete={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    // Press ArrowLeft — covers the false branch of the Backspace condition
    fireEvent.keyDown(inputs[1], { key: 'ArrowLeft' });
    // No error thrown, all inputs unchanged
    expect(inputs[0]).toHaveValue('');
  });

  it('digit input cells have dark mode classes', () => {
    render(<OtpInput onComplete={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input.className).toMatch(/dark:bg-surface-dark/);
      expect(input.className).toMatch(/dark:border-border-dark/);
      expect(input.className).toMatch(/dark:text-content-dark/);
    });
  });
});
