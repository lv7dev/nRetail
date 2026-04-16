import { act, createRef, useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual<typeof import('@/components/ui')>('@/components/ui');

  return {
    ...actual,
    Icon: ({ name, className }: { name: string; className?: string }) => (
      <svg data-testid={`icon-${name}`} className={className} aria-hidden="true" />
    ),
  };
});

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

  it('does not render the pull indicator at rest', () => {
    render(
      <ScrollablePage onRefresh={vi.fn()}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    expect(screen.queryByText('scrollablePage.pullToRefresh')).not.toBeInTheDocument();
    expect(screen.queryByText('scrollablePage.releaseToRefresh')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Refreshing content')).not.toBeInTheDocument();
  });

  it('shows the pull indicator below the refresh threshold', () => {
    render(
      <ScrollablePage onRefresh={vi.fn()}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0, writable: true });

    fireEvent.touchStart(container, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 0, clientY: 30 }],
    });

    const label = screen.getByText('scrollablePage.pullToRefresh');
    const indicator = label.parentElement?.parentElement;
    const chevron = screen.getByTestId('icon-chevron-down');

    expect(indicator).toHaveStyle({ height: '30px' });
    expect(chevron.parentElement).toHaveClass('transition-transform', 'duration-200');
    expect(chevron.parentElement).not.toHaveClass('rotate-180');
  });

  it('shows the release indicator at and above the refresh threshold', () => {
    render(
      <ScrollablePage onRefresh={vi.fn()}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0, writable: true });

    fireEvent.touchStart(container, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 0, clientY: 60 }],
    });

    const label = screen.getByText('scrollablePage.releaseToRefresh');
    const indicator = label.parentElement?.parentElement;
    const chevron = screen.getByTestId('icon-chevron-down');

    expect(indicator).toHaveStyle({ height: '48px' });
    expect(chevron.parentElement).toHaveClass('rotate-180');
  });

  it('caps the pull indicator height at 48px', () => {
    render(
      <ScrollablePage onRefresh={vi.fn()}>
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

    const label = screen.getByText('scrollablePage.releaseToRefresh');
    const indicator = label.parentElement?.parentElement;

    expect(indicator).toHaveStyle({ height: '48px' });
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

  it('shows only the spinner when refreshing without an active pull gesture', () => {
    render(
      <ScrollablePage isRefreshing onRefresh={vi.fn()}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    expect(screen.getByLabelText('Refreshing content')).toBeInTheDocument();
    expect(screen.queryByText('scrollablePage.pullToRefresh')).not.toBeInTheDocument();
    expect(screen.queryByText('scrollablePage.releaseToRefresh')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-chevron-down')).not.toBeInTheDocument();
  });

  it('does not call onRefresh and clears the indicator when the pull is released below the threshold', async () => {
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
      touches: [{ clientX: 0, clientY: 30 }],
    });
    fireEvent.touchEnd(container);

    expect(onRefresh).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText('scrollablePage.pullToRefresh')).not.toBeInTheDocument();
    });
  });

  it('calls onRefresh and clears the pull indicator after the refresh resolves when released above the threshold', async () => {
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
    expect(screen.queryByText('scrollablePage.releaseToRefresh')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Refreshing content')).toBeInTheDocument();

    await act(async () => {
      resolveRefresh?.();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.queryByLabelText('Refreshing content')).not.toBeInTheDocument();
    });
  });

  it('emits onCollapsedChange(true) when scrolled down past the threshold', () => {
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
      value: 20,
      writable: true,
    });
    fireEvent.scroll(container);

    expect(onCollapsedChange).toHaveBeenNthCalledWith(1, false);
    expect(onCollapsedChange).toHaveBeenNthCalledWith(2, true);
  });

  it('emits onCollapsedChange(false) when back at top', () => {
    const onCollapsedChange = vi.fn();
    render(
      <ScrollablePage onCollapsedChange={onCollapsedChange}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0, writable: true });

    fireEvent.scroll(container);

    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it('does not emit collapse changes for scrollTop=1', () => {
    const onCollapsedChange = vi.fn();
    render(
      <ScrollablePage onCollapsedChange={onCollapsedChange}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 1, writable: true });

    fireEvent.scroll(container);

    expect(onCollapsedChange).not.toHaveBeenCalled();
  });

  it('does not emit collapse changes for scrollTop=19', () => {
    const onCollapsedChange = vi.fn();
    render(
      <ScrollablePage onCollapsedChange={onCollapsedChange}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      value: 19,
      writable: true,
    });

    fireEvent.scroll(container);

    expect(onCollapsedChange).not.toHaveBeenCalled();
  });

  it('emits onCollapsedChange(true) at the 20px boundary', () => {
    const onCollapsedChange = vi.fn();
    render(
      <ScrollablePage onCollapsedChange={onCollapsedChange}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      value: 20,
      writable: true,
    });

    fireEvent.scroll(container);

    expect(onCollapsedChange).toHaveBeenCalledOnce();
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it('absorbs bounce oscillation below the collapse threshold', () => {
    const onCollapsedChange = vi.fn();
    render(
      <ScrollablePage onCollapsedChange={onCollapsedChange}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');

    for (const scrollTop of [0, 3, 0, 2, 0]) {
      Object.defineProperty(container, 'scrollTop', {
        configurable: true,
        value: scrollTop,
        writable: true,
      });
      fireEvent.scroll(container);
    }

    expect(onCollapsedChange).toHaveBeenCalledTimes(3);
    expect(onCollapsedChange).toHaveBeenNthCalledWith(1, false);
    expect(onCollapsedChange).toHaveBeenNthCalledWith(2, false);
    expect(onCollapsedChange).toHaveBeenNthCalledWith(3, false);
  });

  it('deduplicates consecutive collapsed=true emissions above the threshold', () => {
    const onCollapsedChange = vi.fn();
    render(
      <ScrollablePage onCollapsedChange={onCollapsedChange}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');

    for (const scrollTop of [30, 50, 80]) {
      Object.defineProperty(container, 'scrollTop', {
        configurable: true,
        value: scrollTop,
        writable: true,
      });
      fireEvent.scroll(container);
    }

    expect(onCollapsedChange).toHaveBeenCalledTimes(1);
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it('prevents native touchmove scrolling while a pull gesture is active', () => {
    render(
      <ScrollablePage onRefresh={vi.fn()}>
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

    const nativeTouchMove = new Event('touchmove', { cancelable: true });
    const preventDefault = vi.spyOn(nativeTouchMove, 'preventDefault');
    container.dispatchEvent(nativeTouchMove);

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('does not prevent native touchmove scrolling when a pull gesture is not active', () => {
    render(
      <ScrollablePage onRefresh={vi.fn()}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0, writable: true });

    fireEvent.touchStart(container, {
      touches: [{ clientX: 0, clientY: 0 }],
    });

    const nativeTouchMove = new Event('touchmove', { cancelable: true });
    const preventDefault = vi.spyOn(nativeTouchMove, 'preventDefault');
    container.dispatchEvent(nativeTouchMove);

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('does not report collapse changes during an active pull gesture', () => {
    const onCollapsedChange = vi.fn();
    render(
      <ScrollablePage onRefresh={vi.fn()} onCollapsedChange={onCollapsedChange}>
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

    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      value: 24,
      writable: true,
    });
    fireEvent.scroll(container);

    expect(onCollapsedChange).not.toHaveBeenCalled();
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

  it('scrollContainerRef is populated before descendant useEffects run', () => {
    const scrollContainerRef = createRef<HTMLDivElement>();
    let refValueInEffect: HTMLDivElement | null | undefined = undefined;

    function DescendantConsumer() {
      useEffect(() => {
        refValueInEffect = scrollContainerRef.current;
      });
      return null;
    }

    render(
      <ScrollablePage scrollContainerRef={scrollContainerRef}>
        <DescendantConsumer />
      </ScrollablePage>,
    );

    expect(refValueInEffect).toBe(screen.getByTestId('scrollable-page'));
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

  it('does not call onRefresh when wheel fires within 400ms of arriving at the top', () => {
    const onRefresh = vi.fn();
    let nowValue = 1000;
    const now = vi.spyOn(performance, 'now');
    now.mockImplementation(() => nowValue);

    render(
      <ScrollablePage onRefresh={onRefresh}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0, writable: true });
    fireEvent.scroll(container);
    nowValue = 1200;
    fireEvent.wheel(container, { deltaY: -10 });

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('calls onRefresh when wheel fires after 400ms have elapsed since arriving at the top', () => {
    const onRefresh = vi.fn();
    let nowValue = 1000;
    const now = vi.spyOn(performance, 'now');
    now.mockImplementation(() => nowValue);

    render(
      <ScrollablePage onRefresh={onRefresh}>
        <div>Page body</div>
      </ScrollablePage>,
    );

    const container = screen.getByTestId('scrollable-page');
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0, writable: true });
    fireEvent.scroll(container);
    nowValue = 1500;
    fireEvent.wheel(container, { deltaY: -10 });

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls onRefresh on wheel at mount-time top when there was no recent scroll-to-top event', () => {
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
