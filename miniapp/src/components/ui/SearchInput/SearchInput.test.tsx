import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchInput } from './SearchInput';

vi.mock('@/components/ui/Icon/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

describe('SearchInput', () => {
  it('renders a search icon and input inside a rounded-xl wrapper', () => {
    const { container } = render(<SearchInput />);

    expect(screen.getByTestId('icon-magnifying-glass')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('rounded-xl');
  });

  it('forwards value and onChange to the input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchInput value="foo" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('foo');

    await user.type(input, 'bar');

    expect(handleChange).toHaveBeenCalled();
  });

  it('forwards placeholder and readOnly props', () => {
    render(<SearchInput placeholder="Search outlets" readOnly />);

    const input = screen.getByPlaceholderText('Search outlets');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('readOnly');
  });

  it('applies className to the wrapper and not the input', () => {
    const { container } = render(<SearchInput className="mt-2" />);

    expect(container.firstElementChild).toHaveClass('mt-2');
    expect(screen.getByRole('textbox')).not.toHaveClass('mt-2');
  });

  it('focuses the input when the search icon is clicked', () => {
    render(<SearchInput />);

    const input = screen.getByRole('textbox');
    const iconButton = screen.getByTestId('icon-magnifying-glass').closest('button')!;

    fireEvent.click(iconButton);

    expect(input).toHaveFocus();
  });

  it('focuses the input when clicking the wrapper container area', () => {
    const { container } = render(<SearchInput />);

    const input = screen.getByRole('textbox');
    fireEvent.click(container.firstElementChild!);

    expect(input).toHaveFocus();
  });

  it('shows clear button when value is non-empty and onClear is provided', () => {
    render(<SearchInput value="hello" onClear={vi.fn()} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'clear' })).toBeInTheDocument();
    expect(screen.getByTestId('icon-xmark')).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchInput value="" onClear={vi.fn()} onChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'clear' })).not.toBeInTheDocument();
  });

  it('hides clear button when onClear is not provided', () => {
    render(<SearchInput value="hello" onChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'clear' })).not.toBeInTheDocument();
  });

  it('calls onClear when the clear button is clicked', async () => {
    const user = userEvent.setup();
    const handleClear = vi.fn();

    render(<SearchInput value="hello" onClear={handleClear} onChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'clear' }));

    expect(handleClear).toHaveBeenCalledOnce();
  });
});
