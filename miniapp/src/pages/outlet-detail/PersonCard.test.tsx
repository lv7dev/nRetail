import { render, screen } from '@testing-library/react';
import PersonCard from './PersonCard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('PersonCard', () => {
  const defaultProps = {
    name: 'Nguyen Van A',
    phone: '0901234567',
    lastUpdated: '2024-01-15',
  };

  it('renders name prop', () => {
    render(<PersonCard {...defaultProps} />);
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
  });

  it('renders phone prop', () => {
    render(<PersonCard {...defaultProps} />);
    expect(screen.getByText('0901234567')).toBeInTheDocument();
  });

  it('renders lastUpdated prop', () => {
    render(<PersonCard {...defaultProps} />);
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('renders active badge when isActive is true', () => {
    render(<PersonCard {...defaultProps} isActive={true} />);
    expect(screen.getByText('contact.active')).toBeInTheDocument();
  });

  it('renders inactive badge when isActive is false', () => {
    render(<PersonCard {...defaultProps} isActive={false} />);
    expect(screen.getByText('contact.inactive')).toBeInTheDocument();
  });
});
