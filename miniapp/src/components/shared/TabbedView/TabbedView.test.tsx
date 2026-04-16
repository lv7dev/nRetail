import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

const scrollablePageMock = vi.fn(
  ({
    children,
    onRefresh,
    onLoadMore,
    hasMore,
    isRefreshing,
    isLoadingMore,
  }: {
    children: ReactNode;
    onRefresh?: () => void | Promise<void>;
    onLoadMore?: () => void | Promise<void>;
    hasMore?: boolean;
    isRefreshing?: boolean;
    isLoadingMore?: boolean;
  }) => (
    <div
      data-testid="scrollable-page"
      data-has-more={hasMore ? 'true' : 'false'}
      data-refreshing={isRefreshing ? 'true' : 'false'}
      data-loading-more={isLoadingMore ? 'true' : 'false'}
      onClick={() => {
        void onRefresh?.();
        void onLoadMore?.();
      }}
    >
      {children}
    </div>
  ),
);

vi.mock('../ScrollablePage', () => ({
  ScrollablePage: (props: Parameters<typeof scrollablePageMock>[0]) => scrollablePageMock(props),
}));

import { TabbedView } from './index';

const tabs = [
  { key: 'bought', label: 'Bought' },
  { key: 'viewed', label: 'Viewed' },
];

describe('TabbedView', () => {
  beforeEach(() => {
    scrollablePageMock.mockClear();
  });

  it('connects TabBar and Panels through context in uncontrolled mode', async () => {
    const user = userEvent.setup();

    render(
      <TabbedView tabs={tabs} defaultTab="bought">
        <div>
          <TabbedView.TabBar />
        </div>
        <div>
          <TabbedView.Panels mode="outer" outerScrollRef={{ current: null }}>
            <TabbedView.Panel tabKey="bought">
              <div>Bought panel</div>
            </TabbedView.Panel>
            <TabbedView.Panel tabKey="viewed">
              <div>Viewed panel</div>
            </TabbedView.Panel>
          </TabbedView.Panels>
        </div>
      </TabbedView>,
    );

    expect(screen.getByText('Bought panel').parentElement).not.toHaveStyle({ display: 'none' });
    expect(screen.getByText('Viewed panel').parentElement).toHaveStyle({ display: 'none' });

    await user.click(screen.getByRole('button', { name: 'Viewed' }));

    expect(screen.getByText('Bought panel').parentElement).toHaveStyle({ display: 'none' });
    expect(screen.getByText('Viewed panel').parentElement).not.toHaveStyle({ display: 'none' });
  });

  it('supports controlled mode via activeTab and onTabChange props', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    render(
      <TabbedView tabs={tabs} activeTab="bought" onTabChange={onTabChange}>
        <TabbedView.TabBar />
        <TabbedView.Panels mode="outer" outerScrollRef={{ current: null }}>
          <TabbedView.Panel tabKey="bought">
            <div>Bought panel</div>
          </TabbedView.Panel>
          <TabbedView.Panel tabKey="viewed">
            <div>Viewed panel</div>
          </TabbedView.Panel>
        </TabbedView.Panels>
      </TabbedView>,
    );

    await user.click(screen.getByRole('button', { name: 'Viewed' }));

    expect(onTabChange).toHaveBeenCalledWith('viewed');
    expect(screen.getByText('Bought panel').parentElement).not.toHaveStyle({ display: 'none' });
    expect(screen.getByText('Viewed panel').parentElement).toHaveStyle({ display: 'none' });
  });

  it('forwards className from TabbedView.TabBar to TabBar', () => {
    const { container } = render(
      <TabbedView tabs={tabs} defaultTab="bought">
        <TabbedView.TabBar className="sticky top-0 bg-surface" />
      </TabbedView>,
    );

    expect(container.querySelector('.sticky')).toHaveClass('sticky', 'top-0', 'bg-surface');
  });

  it('keeps all panels mounted and hides inactive panels with display none', async () => {
    const user = userEvent.setup();

    render(
      <TabbedView tabs={tabs} defaultTab="bought">
        <TabbedView.TabBar />
        <TabbedView.Panels mode="outer" outerScrollRef={{ current: null }}>
          <TabbedView.Panel tabKey="bought">
            <input aria-label="bought-input" defaultValue="kept" />
          </TabbedView.Panel>
          <TabbedView.Panel tabKey="viewed">
            <div>Viewed panel</div>
          </TabbedView.Panel>
        </TabbedView.Panels>
      </TabbedView>,
    );

    const input = screen.getByLabelText('bought-input');
    expect(input).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Viewed' }));
    await user.click(screen.getByRole('button', { name: 'Bought' }));

    expect(screen.getByLabelText('bought-input')).toHaveValue('kept');
  });

  it('wraps each panel in ScrollablePage for self mode and forwards scroll props', () => {
    const onRefresh = vi.fn();
    const onLoadMore = vi.fn();

    render(
      <TabbedView tabs={tabs} defaultTab="bought">
        <TabbedView.Panels mode="self">
          <TabbedView.Panel
            tabKey="bought"
            onRefresh={onRefresh}
            onLoadMore={onLoadMore}
            hasMore
            isRefreshing
            isLoadingMore
          >
            <div>Bought panel</div>
          </TabbedView.Panel>
          <TabbedView.Panel tabKey="viewed">
            <div>Viewed panel</div>
          </TabbedView.Panel>
        </TabbedView.Panels>
      </TabbedView>,
    );

    expect(screen.getAllByTestId('scrollable-page')).toHaveLength(2);
    expect(scrollablePageMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        onRefresh,
        onLoadMore,
        hasMore: true,
        isRefreshing: true,
        isLoadingMore: true,
      }),
    );
  });

  it('does not render ScrollablePage wrappers in outer mode', () => {
    render(
      <TabbedView tabs={tabs} defaultTab="bought">
        <TabbedView.Panels mode="outer" outerScrollRef={{ current: null }}>
          <TabbedView.Panel tabKey="bought">
            <div>Bought panel</div>
          </TabbedView.Panel>
          <TabbedView.Panel tabKey="viewed">
            <div>Viewed panel</div>
          </TabbedView.Panel>
        </TabbedView.Panels>
      </TabbedView>,
    );

    expect(screen.queryByTestId('scrollable-page')).not.toBeInTheDocument();
  });

  it('saves outgoing outer scroll position, restores visited tabs, and scrolls first visits using element rects', async () => {
    const user = userEvent.setup();
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const outerScrollElement = {
      scrollTop: 120,
      addEventListener,
      removeEventListener,
      getBoundingClientRect: vi.fn(() => ({
        top: 100,
      })),
    } as unknown as HTMLDivElement;
    const outerScrollRef = { current: outerScrollElement };

    render(
      <TabbedView tabs={tabs} defaultTab="bought">
        <TabbedView.TabBar />
        <TabbedView.Panels mode="outer" outerScrollRef={outerScrollRef}>
          <TabbedView.Panel tabKey="bought">
            <div>Bought panel</div>
          </TabbedView.Panel>
          <TabbedView.Panel tabKey="viewed">
            <div>Viewed panel</div>
          </TabbedView.Panel>
        </TabbedView.Panels>
      </TabbedView>,
    );

    const panelsElement = screen.getByText('Bought panel').parentElement
      ?.parentElement as HTMLDivElement;
    vi.spyOn(panelsElement, 'getBoundingClientRect').mockImplementation(
      () =>
        ({
          top: 340,
        }) as DOMRect,
    );

    const handleScroll = addEventListener.mock.calls.find(
      ([eventName]) => eventName === 'scroll',
    )?.[1] as EventListener | undefined;

    expect(handleScroll).toBeTypeOf('function');

    outerScrollElement.scrollTop = 800;
    handleScroll?.(new Event('scroll'));
    await user.click(screen.getByRole('button', { name: 'Viewed' }));

    expect(outerScrollElement.scrollTop).toBe(1040);

    outerScrollElement.scrollTop = 600;
    await user.click(screen.getByRole('button', { name: 'Bought' }));

    expect(outerScrollElement.scrollTop).toBe(800);
  });

  it('saves the last known outer scroll position before a tab switch clamp', async () => {
    const user = userEvent.setup();
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const outerScrollElement = {
      scrollTop: 120,
      addEventListener,
      removeEventListener,
      getBoundingClientRect: vi.fn(() => ({
        top: 100,
      })),
    } as unknown as HTMLDivElement;
    const outerScrollRef = { current: outerScrollElement };

    render(
      <TabbedView tabs={tabs} defaultTab="bought">
        <TabbedView.TabBar />
        <TabbedView.Panels mode="outer" outerScrollRef={outerScrollRef}>
          <TabbedView.Panel tabKey="bought">
            <div>Bought panel</div>
          </TabbedView.Panel>
          <TabbedView.Panel tabKey="viewed">
            <div>Viewed panel</div>
          </TabbedView.Panel>
        </TabbedView.Panels>
      </TabbedView>,
    );

    const handleScroll = addEventListener.mock.calls.find(
      ([eventName]) => eventName === 'scroll',
    )?.[1] as EventListener | undefined;

    expect(handleScroll).toBeTypeOf('function');

    outerScrollElement.scrollTop = 800;
    handleScroll?.(new Event('scroll'));

    outerScrollElement.scrollTop = 400;
    await user.click(screen.getByRole('button', { name: 'Viewed' }));

    outerScrollElement.scrollTop = 200;
    await user.click(screen.getByRole('button', { name: 'Bought' }));

    expect(outerScrollElement.scrollTop).toBe(800);
  });

  it('does not attach an outer scroll listener in self mode', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const outerScrollRef = {
      current: {
        addEventListener,
        removeEventListener,
      } as unknown as HTMLDivElement,
    };

    render(
      <TabbedView tabs={tabs} defaultTab="bought">
        <TabbedView.Panels mode="self" outerScrollRef={outerScrollRef}>
          <TabbedView.Panel tabKey="bought">
            <div>Bought panel</div>
          </TabbedView.Panel>
          <TabbedView.Panel tabKey="viewed">
            <div>Viewed panel</div>
          </TabbedView.Panel>
        </TabbedView.Panels>
      </TabbedView>,
    );

    expect(addEventListener).not.toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      expect.anything(),
    );
    expect(removeEventListener).not.toHaveBeenCalled();
  });
});
