import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

import SearchBar from './SearchBar';

describe('SearchBar', () => {
  it('renders a search icon', () => {
    render(<SearchBar />);
    expect(screen.getByTestId('icon-magnifying-glass')).toBeInTheDocument();
  });

  it('renders the placeholder text from i18n', () => {
    render(<SearchBar />);
    expect(screen.getByText('search.placeholder')).toBeInTheDocument();
  });

  it('accepts an optional className', () => {
    const { container } = render(<SearchBar className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });
});
