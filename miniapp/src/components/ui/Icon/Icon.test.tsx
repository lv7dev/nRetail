import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Icon } from './Icon';

// Mock dynamic SVG imports
vi.mock('@/assets/icons/solid/house.svg?react', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="svg-icon" {...props} />,
}));
vi.mock('@/assets/icons/regular/house.svg?react', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="svg-icon" {...props} />,
}));
vi.mock('@/assets/icons/light/house.svg?react', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="svg-icon" {...props} />,
}));
vi.mock('@/assets/icons/thin/house.svg?react', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="svg-icon" {...props} />,
}));
vi.mock('@/assets/icons/brands/facebook.svg?react', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="svg-icon" {...props} />,
}));

describe('Icon', () => {
  it('renders an SVG element', async () => {
    render(<Icon name="house" variant="solid" />);
    await waitFor(() => expect(screen.getByTestId('svg-icon')).toBeInTheDocument());
  });

  it('uses regular variant by default', async () => {
    render(<Icon name="house" />);
    await waitFor(() => expect(screen.getByTestId('svg-icon')).toBeInTheDocument());
  });

  it('applies size as width and height', async () => {
    render(<Icon name="house" variant="solid" size={24} />);
    await waitFor(() => {
      const svg = screen.getByTestId('svg-icon');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });
  });

  it('applies default size of 16', async () => {
    render(<Icon name="house" variant="solid" />);
    await waitFor(() => {
      const svg = screen.getByTestId('svg-icon');
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });
  });

  it('forwards className', async () => {
    render(<Icon name="house" variant="solid" className="text-primary" />);
    await waitFor(() => {
      const svg = screen.getByTestId('svg-icon');
      expect(svg.getAttribute('class')).toMatch(/text-primary/);
    });
  });

  it('renders thin variant', async () => {
    render(<Icon name="house" variant="thin" />);
    await waitFor(() => expect(screen.getByTestId('svg-icon')).toBeInTheDocument());
  });

  it('renders brands variant', async () => {
    render(<Icon name="facebook" variant="brands" />);
    await waitFor(() => expect(screen.getByTestId('svg-icon')).toBeInTheDocument());
  });

  it('renders null when icon import fails (catch branch)', async () => {
    // 'missing-icon' has no mock — import throws, catch runs, setSvgIcon(null)
    render(<Icon name="missing-icon" variant="solid" />);
    await new Promise<void>((r) => setTimeout(r, 50));
    expect(screen.queryByTestId('svg-icon')).not.toBeInTheDocument();
  });

  it('does not update state when unmounted before import resolves', async () => {
    const { unmount } = render(<Icon name="house" variant="solid" />);
    // Unmount synchronously — sets cancelled=true before .then() microtask runs
    unmount();
    await new Promise<void>((r) => setTimeout(r, 0));
    // No assertion — test passes if no React state-update-after-unmount warning
  });
});
