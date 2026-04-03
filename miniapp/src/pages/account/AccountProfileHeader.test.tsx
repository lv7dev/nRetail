import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AccountProfileHeader from './AccountProfileHeader';

vi.mock('@/components/ui', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

describe('AccountProfileHeader', () => {
  it('renders outlet name', () => {
    render(<AccountProfileHeader outletName="Quản Đại An" phone="0901234567" />);
    expect(screen.getByText('Quản Đại An')).toBeInTheDocument();
  });

  it('renders phone number', () => {
    render(<AccountProfileHeader outletName="Quản Đại An" phone="0901234567" />);
    expect(screen.getByText('0901234567')).toBeInTheDocument();
  });

  it('renders the globe icon', () => {
    render(<AccountProfileHeader outletName="Quản Đại An" phone="0901234567" />);
    expect(screen.getByTestId('icon-globe')).toBeInTheDocument();
  });

  it('has bg-primary class on the container', () => {
    render(<AccountProfileHeader outletName="Quản Đại An" phone="0901234567" />);
    const text = screen.getByText('Quản Đại An');
    const container = text.closest('.bg-primary');
    expect(container).toBeInTheDocument();
  });
});
