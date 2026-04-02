import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import SegmentationTab from './SegmentationTab';

describe('SegmentationTab', () => {
  it('renders the coming-soon stub text', () => {
    render(<SegmentationTab />);
    expect(screen.getByText('stubs.segmentation')).toBeInTheDocument();
  });
});
