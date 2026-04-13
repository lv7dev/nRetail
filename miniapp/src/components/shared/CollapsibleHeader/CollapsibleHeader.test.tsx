import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let intersectionCallback: IntersectionObserverCallback | undefined;
let resizeCallback: ResizeObserverCallback | undefined;
const observe = vi.fn();
const disconnect = vi.fn();
const resizeObserve = vi.fn();
const resizeDisconnect = vi.fn();

vi.stubGlobal(
  'IntersectionObserver',
  class {
    root: Element | Document | null;

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      intersectionCallback = callback;
      this.root = options?.root ?? null;
    }

    observe = observe;
    disconnect = disconnect;
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
  },
);

vi.stubGlobal(
  'ResizeObserver',
  class {
    constructor(callback: ResizeObserverCallback) {
      resizeCallback = callback;
    }

    observe = resizeObserve;
    disconnect = resizeDisconnect;
    unobserve = vi.fn();
  },
);

import { CollapsibleHeader } from './CollapsibleHeader';

function MockCard({ collapsed = false }: { collapsed?: boolean }) {
  return <div data-testid="card-state">{collapsed ? 'collapsed' : 'expanded'}</div>;
}

describe('CollapsibleHeader', () => {
  beforeEach(() => {
    intersectionCallback = undefined;
    resizeCallback = undefined;
    observe.mockClear();
    disconnect.mockClear();
    resizeObserve.mockClear();
    resizeDisconnect.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders topBar, children, and card slots', () => {
    render(
      <CollapsibleHeader topBar={<div>Top bar</div>} card={<MockCard />}>
        <div>Sub header</div>
      </CollapsibleHeader>,
    );

    expect(screen.getByText('Top bar')).toBeInTheDocument();
    expect(screen.getByText('Sub header')).toBeInTheDocument();
    expect(screen.getByTestId('card-state')).toHaveTextContent('expanded');
  });

  it('renders a decoration node inside the background zone when provided', () => {
    render(
      <CollapsibleHeader
        topBar={<div>Top bar</div>}
        decoration={<div data-testid="header-decoration">Wave</div>}
      >
        <div>Sub header</div>
      </CollapsibleHeader>,
    );

    expect(screen.getByTestId('header-decoration')).toBeInTheDocument();
  });

  it('renders a clean background when no decoration prop is provided', () => {
    render(
      <CollapsibleHeader topBar={<div>Top bar</div>}>
        <div>Sub header</div>
      </CollapsibleHeader>,
    );

    expect(screen.queryByTestId('header-decoration')).not.toBeInTheDocument();
  });

  it('passes collapsed=false initially, then true when sentinel exits, then false when it re-enters', () => {
    const scrollContainerRef = { current: document.createElement('div') };

    render(<CollapsibleHeader card={<MockCard />} scrollContainerRef={scrollContainerRef} />);

    expect(screen.getByTestId('card-state')).toHaveTextContent('expanded');
    expect(observe).toHaveBeenCalled();

    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByTestId('card-state')).toHaveTextContent('collapsed');

    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByTestId('card-state')).toHaveTextContent('expanded');
  });

  it('renders the collapsed card wrapper as relative instead of sticky', () => {
    render(<CollapsibleHeader card={<MockCard />} />);

    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByTestId('collapsible-header-card-shell').className).toMatch(/relative/);
    expect(screen.getByTestId('collapsible-header-card-shell').className).not.toMatch(/sticky/);
  });

  it('uses the controlled collapsed prop when provided', () => {
    const { rerender } = render(<CollapsibleHeader card={<MockCard />} collapsed={false} />);

    expect(screen.getByTestId('card-state')).toHaveTextContent('expanded');

    rerender(<CollapsibleHeader card={<MockCard />} collapsed />);

    expect(screen.getByTestId('card-state')).toHaveTextContent('collapsed');
  });

  it('renders gracefully when the card slot is omitted', () => {
    render(
      <CollapsibleHeader topBar={<div>Top bar</div>}>
        <div>Sub header</div>
      </CollapsibleHeader>,
    );

    expect(screen.getByText('Top bar')).toBeInTheDocument();
    expect(screen.queryByTestId('collapsible-header-card-shell')).not.toBeInTheDocument();
  });

  it('omits card overlap spacing styles when no card is provided', () => {
    render(
      <CollapsibleHeader topBar={<div>Top bar</div>}>
        <div>Sub header</div>
      </CollapsibleHeader>,
    );

    const topZone = screen.getByText('Top bar').parentElement?.parentElement;

    expect(topZone).not.toBeNull();
    expect(topZone?.className).not.toMatch(/pb-8/);
    expect(topZone?.className).not.toMatch(/rounded-b-3xl/);
    expect(topZone?.className).toMatch(/bg-primary/);
  });

  it('applies card overlap spacing styles when a card is provided', () => {
    render(
      <CollapsibleHeader topBar={<div>Top bar</div>} card={<MockCard />}>
        <div>Sub header</div>
      </CollapsibleHeader>,
    );

    const topZone = screen.getByText('Top bar').parentElement?.parentElement;

    expect(topZone).not.toBeNull();
    expect(topZone).toHaveStyle({ paddingBottom: '32px' });
    expect(topZone?.className).toMatch(/rounded-b-3xl/);
    expect(topZone?.className).toMatch(/bg-primary/);
  });

  it('still renders when ResizeObserver is unavailable', () => {
    vi.stubGlobal('ResizeObserver', undefined);

    render(<CollapsibleHeader card={<MockCard />} topBar={<div>Top bar</div>} />);

    expect(screen.getByText('Top bar')).toBeInTheDocument();
  });

  it('still renders when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    render(<CollapsibleHeader card={<MockCard />} />);

    expect(screen.getByTestId('card-state')).toHaveTextContent('expanded');
  });

  it('does not render an inline sticky offset style when collapsed', () => {
    render(<CollapsibleHeader card={<MockCard />} />);

    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByTestId('collapsible-header-card-shell')).not.toHaveStyle({ top: '0px' });
  });

  it('applies default cardOverlap of 32px to topZone paddingBottom and card shell marginTop', () => {
    render(<CollapsibleHeader topBar={<div>Top bar</div>} card={<MockCard />} />);

    const topZone = screen.getByText('Top bar').parentElement?.parentElement;
    const cardShell = screen.getByTestId('collapsible-header-card-shell');

    expect(topZone).toHaveStyle({ paddingBottom: '32px' });
    expect(cardShell).toHaveStyle({ marginTop: '-32px' });
  });

  it('applies custom cardOverlap to topZone paddingBottom and card shell marginTop', () => {
    render(<CollapsibleHeader topBar={<div>Top bar</div>} card={<MockCard />} cardOverlap={48} />);

    const topZone = screen.getByText('Top bar').parentElement?.parentElement;
    const cardShell = screen.getByTestId('collapsible-header-card-shell');

    expect(topZone).toHaveStyle({ paddingBottom: '48px' });
    expect(cardShell).toHaveStyle({ marginTop: '-48px' });
  });

  it('does not apply paddingBottom or marginTop when no card is provided', () => {
    render(<CollapsibleHeader topBar={<div>Top bar</div>} />);

    const topZone = screen.getByText('Top bar').parentElement?.parentElement;

    expect(topZone).not.toHaveStyle({ paddingBottom: '32px' });
    expect(screen.queryByTestId('collapsible-header-card-shell')).not.toBeInTheDocument();
  });

  it('applies default cardRadius rounded-b-3xl to topZone when card is present', () => {
    render(<CollapsibleHeader topBar={<div>Top bar</div>} card={<MockCard />} />);

    const topZone = screen.getByText('Top bar').parentElement?.parentElement;

    expect(topZone?.className).toMatch(/rounded-b-3xl/);
  });

  it('applies custom cardRadius to topZone when provided', () => {
    render(
      <CollapsibleHeader
        topBar={<div>Top bar</div>}
        card={<MockCard />}
        cardRadius="rounded-b-xl"
      />,
    );

    const topZone = screen.getByText('Top bar').parentElement?.parentElement;

    expect(topZone?.className).toMatch(/rounded-b-xl/);
    expect(topZone?.className).not.toMatch(/rounded-b-3xl/);
  });

  it('does not apply any radius class to topZone when no card is provided', () => {
    render(<CollapsibleHeader topBar={<div>Top bar</div>} />);

    const topZone = screen.getByText('Top bar').parentElement?.parentElement;

    expect(topZone?.className).not.toMatch(/rounded-b-3xl/);
    expect(topZone?.className).not.toMatch(/rounded-b-xl/);
  });
});
