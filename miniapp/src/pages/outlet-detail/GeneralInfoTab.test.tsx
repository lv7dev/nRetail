import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import GeneralInfoTab from './GeneralInfoTab';

describe('GeneralInfoTab', () => {
  it('renders the coming-soon stub text', () => {
    render(<GeneralInfoTab />);
    expect(screen.getByText('stubs.generalInfo')).toBeInTheDocument();
  });
});
