import { act, createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let intersectionCallback: IntersectionObserverCallback | undefined;
const observe = vi.fn();
const disconnect = vi.fn();

vi.stubGlobal(
  'IntersectionObserver',
  class {
    constructor(callback: IntersectionObserverCallback) {
      intersectionCallback = callback;
    }

    observe = observe;
    disconnect = disconnect;
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
  },
);

import { ScrollablePage } from './ScrollablePage';

describe('ScrollablePage', () => {
  beforeEach(() => {
    intersectionCallback = undefined;
    observe.mockClear();
    disconnect.mockClear();
  });

  it('renders children', () => {
    render(
      <ScrollablePage>
        <div>Page body</div>
      </ScrollablePage>,
    );

    expect(screen.getByText('Page body')).toBeInTheDocument();
  });

  it('calls onRefresh after a pull gesture of at least 60px from scrollTop=0', () => {
    const onRefresh = vi.fn();
    render(
      <ScrollablePage onRefresh={onRefresh}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0, writable: true });

    fireEvent.touchStart(container, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 0, clientY: 80 }],
    });
    fireEvent.touchEnd(container);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not call onRefresh when scrollTop is greater than 0', () => {
    const onRefresh = vi.fn();
    render(
      <ScrollablePage onRefresh={onRefresh}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      value: 10,
      writable: true,
    });

    fireEvent.touchStart(container, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 0, clientY: 80 }],
    });
    fireEvent.touchEnd(container);

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('calls onLoadMore when the sentinel intersects and hasMore=true', () => {
    const onLoadMore = vi.fn();
    render(
      <ScrollablePage onLoadMore={onLoadMore} hasMore>
        <div>Page body</div>
      </ScrollablePage>,
    );

    intersectionCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('does not call onLoadMore when hasMore=false', () => {
    const onLoadMore = vi.fn();
    render(
      <ScrollablePage onLoadMore={onLoadMore} hasMore={false}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    intersectionCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('shows the loading more spinner when isLoadingMore=true', () => {
    render(
      <ScrollablePage isLoadingMore>
        <div>Page body</div>
      </ScrollablePage>,
    );

    expect(screen.getByLabelText('Loading more')).toBeInTheDocument();
  });

  it('does not render a load-more sentinel when onLoadMore is not provided', () => {
    render(
      <ScrollablePage>
        <div>Page body</div>
      </ScrollablePage>,
    );

    expect(screen.queryByTestId('scrollable-page-sentinel')).not.toBeInTheDocument();
  });

  it('does not call onLoadMore while already loading more', () => {
    const onLoadMore = vi.fn();
    render(
      <ScrollablePage onLoadMore={onLoadMore} hasMore isLoadingMore>
        <div>Page body</div>
      </ScrollablePage>,
    );

    intersectionCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not start pull-to-refresh without an onRefresh handler', () => {
    render(
      <ScrollablePage>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');

    fireEvent.touchStart(container, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 0, clientY: 80 }],
    });
    fireEvent.touchEnd(container);

    expect(screen.queryByLabelText('Refreshing content')).not.toBeInTheDocument();
  });

  it('does not trigger pull-to-refresh for a horizontal-dominant gesture', () => {
    const onRefresh = vi.fn();
    render(
      <ScrollablePage onRefresh={onRefresh}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0, writable: true });

    fireEvent.touchStart(container, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 80, clientY: 30 }],
    });
    fireEvent.touchEnd(container);

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('shows the refresh indicator while isRefreshing=true', () => {
    render(
      <ScrollablePage isRefreshing onRefresh={vi.fn()}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    expect(screen.getByLabelText('Refreshing content')).toBeInTheDocument();
  });

  it('keeps the refresh indicator visible until touch-triggered onRefresh resolves', async () => {
    let resolveRefresh: (() => void) | undefined;
    const onRefresh = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    render(
      <ScrollablePage onRefresh={onRefresh}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0, writable: true });

    fireEvent.touchStart(container, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 0, clientY: 80 }],
    });
    fireEvent.touchEnd(container);

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Refreshing content')).toBeInTheDocument();

    await act(async () => {
      resolveRefresh?.();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.queryByLabelText('Refreshing content')).not.toBeInTheDocument();
    });
  });

  it('reports collapsed=false at the top and collapsed=true after scroll', () => {
    const onCollapsedChange = vi.fn();
    render(
      <ScrollablePage onCollapsedChange={onCollapsedChange}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0, writable: true });
    fireEvent.scroll(container);

    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      value: 24,
      writable: true,
    });
    fireEvent.scroll(container);

    expect(onCollapsedChange).toHaveBeenNthCalledWith(1, false);
    expect(onCollapsedChange).toHaveBeenNthCalledWith(2, true);
  });

  it('assigns the rendered scroll container to the provided ref', () => {
    const scrollContainerRef = createRef<HTMLDivElement>();
    render(
      <ScrollablePage scrollContainerRef={scrollContainerRef}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    expect(scrollContainerRef.current).toBe(screen.getByTestId('scrollable-page'));
  });

  it('calls onRefresh when scrolling up (wheel) at scrollTop=0', () => {
    const onRefresh = vi.fn();
    render(
      <ScrollablePage onRefresh={onRefresh}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0 });

    fireEvent.wheel(container, { deltaY: -10 });

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not call onRefresh when scrolling down (wheel) at scrollTop=0', () => {
    const onRefresh = vi.fn();
    render(
      <ScrollablePage onRefresh={onRefresh}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0 });

    fireEvent.wheel(container, { deltaY: 10 });

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('does not call onRefresh on wheel-up when scrollTop is greater than 0', () => {
    const onRefresh = vi.fn();
    render(
      <ScrollablePage onRefresh={onRefresh}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 10 });

    fireEvent.wheel(container, { deltaY: -10 });

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('does not call onRefresh on wheel-up when no onRefresh handler is provided', () => {
    render(
      <ScrollablePage>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0 });

    fireEvent.wheel(container, { deltaY: -10 });

    expect(screen.queryByLabelText('Refreshing content')).not.toBeInTheDocument();
  });

  it('shows the refresh spinner immediately on wheel-up at scrollTop=0', () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    render(
      <ScrollablePage onRefresh={onRefresh}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0 });

    fireEvent.wheel(container, { deltaY: -10 });

    expect(screen.getByLabelText('Refreshing content')).toBeInTheDocument();
  });

  it('hides the refresh spinner after onRefresh resolves on wheel-up', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    render(
      <ScrollablePage onRefresh={onRefresh}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0 });

    fireEvent.wheel(container, { deltaY: -10 });

    await waitFor(() => {
      expect(screen.queryByLabelText('Refreshing content')).not.toBeInTheDocument();
    });
  });
});
