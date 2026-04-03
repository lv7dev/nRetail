import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui', () => ({
  AppHeader: ({ title, onBack }: { title: string; onBack?: () => void }) => (
    <div data-testid="app-header">
      {onBack && <button onClick={onBack}>back</button>}
      <span>{title}</span>
    </div>
  ),
  TabBar: ({
    tabs,
    activeTab,
    onChange,
  }: {
    tabs: { key: string; label: string }[];
    activeTab: string;
    onChange: (k: string) => void;
  }) => (
    <div data-testid="tab-bar">
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)} aria-selected={t.key === activeTab}>
          {t.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('./OutletAvatar', () => ({
  default: ({ name }: { name: string }) => <div data-testid="outlet-avatar">{name}</div>,
}));

vi.mock('./OutletActionButtons', () => ({
  default: () => <div data-testid="outlet-action-buttons" />,
}));

vi.mock('./ContactTab', () => ({
  default: () => <div data-testid="contact-tab" />,
}));

vi.mock('./GeneralInfoTab', () => ({
  default: () => <div data-testid="general-info-tab" />,
}));

vi.mock('./SegmentationTab', () => ({
  default: () => <div data-testid="segmentation-tab" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import OutletDetailPage from './index';

const renderPage = () =>
  render(
    <MemoryRouter>
      <OutletDetailPage />
    </MemoryRouter>,
  );

describe('OutletDetailPage', () => {
  it('renders the app header with i18n title', () => {
    renderPage();
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByText('header.title')).toBeInTheDocument();
  });

  it('renders the outlet avatar', () => {
    renderPage();
    expect(screen.getByTestId('outlet-avatar')).toBeInTheDocument();
  });

  it('renders the outlet action buttons', () => {
    renderPage();
    expect(screen.getByTestId('outlet-action-buttons')).toBeInTheDocument();
  });

  it('renders the tab bar', () => {
    renderPage();
    expect(screen.getByTestId('tab-bar')).toBeInTheDocument();
  });

  it('shows contact tab content by default', () => {
    renderPage();
    expect(screen.getByTestId('contact-tab')).toBeInTheDocument();
  });

  it('switches to general info tab on click', async () => {
    renderPage();
    await userEvent.click(screen.getByText('tabs.generalInfo'));
    expect(screen.getByTestId('general-info-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('contact-tab')).not.toBeInTheDocument();
  });

  it('switches to segmentation tab on click', async () => {
    renderPage();
    await userEvent.click(screen.getByText('tabs.segmentation'));
    expect(screen.getByTestId('segmentation-tab')).toBeInTheDocument();
  });
});
