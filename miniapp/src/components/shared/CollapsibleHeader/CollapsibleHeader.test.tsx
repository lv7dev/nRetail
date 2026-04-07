import { createRef } from 'react';
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
      <CollapsibleHeader
        topBar={<div>Top bar</div>}
        card={<MockCard />}
      >
        <div>Sub header</div>
      </CollapsibleHeader>,
    );

    expect(screen.getByText('Top bar')).toBeInTheDocument();
    expect(screen.getByText('Sub header')).toBeInTheDocument();
    expect(screen.getByTestId('card-state')).toHaveTextContent('expanded');
  });

  it('passes collapsed=false initially, then true when sentinel exits, then false when it re-enters', () => {
    const scrollContainerRef = createRef<HTMLDivElement>();
    scrollContainerRef.current = document.createElement('div');

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

  it('renders the collapsed card wrapper as sticky', () => {
    render(<CollapsibleHeader card={<MockCard />} />);

    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByTestId('collapsible-header-card-shell').className).toMatch(/sticky/);
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

  it('updates the sticky top offset when the top zone is resized', () => {
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

    const rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ height: 48 } as DOMRect);

    render(<CollapsibleHeader card={<MockCard />} topBar={<div>Top bar</div>} />);

    act(() => {
      resizeCallback?.(
        [{ contentRect: { height: 48 } } as ResizeObserverEntry],
        {} as ResizeObserver,
      );
    });

    expect(resizeCallback).toBeTypeOf('function');
    rectSpy.mockRestore();
  });
});
