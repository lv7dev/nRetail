import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('./PersonCard', () => ({
  default: ({ name }: { name: string }) => <div data-testid="person-card">{name}</div>,
}));

import ContactTab from './ContactTab';

const owner = {
  name: 'Nguyen Van A',
  phone: '0901234567',
  lastUpdated: '2024-01-15',
  isActive: true,
};

const contactPerson = {
  name: 'Tran Thi B',
  phone: '0987654321',
  lastUpdated: '2024-03-01',
  isActive: true,
};

describe('ContactTab', () => {
  it('renders the outlet owner section heading', () => {
    render(<ContactTab owner={owner} contactPerson={contactPerson} />);
    expect(screen.getByText('contact.outletOwner')).toBeInTheDocument();
  });

  it('renders the contact person section heading', () => {
    render(<ContactTab owner={owner} contactPerson={contactPerson} />);
    expect(screen.getByText('contact.contactPerson')).toBeInTheDocument();
  });

  it('renders two PersonCard components', () => {
    render(<ContactTab owner={owner} contactPerson={contactPerson} />);
    const cards = screen.getAllByTestId('person-card');
    expect(cards).toHaveLength(2);
  });

  it('passes owner name to first PersonCard', () => {
    render(<ContactTab owner={owner} contactPerson={contactPerson} />);
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
  });

  it('passes contact person name to second PersonCard', () => {
    render(<ContactTab owner={owner} contactPerson={contactPerson} />);
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
  });
});
