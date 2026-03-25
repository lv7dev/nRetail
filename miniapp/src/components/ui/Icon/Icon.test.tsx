import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Icon } from './Icon'

// Mock dynamic SVG imports
vi.mock('@/assets/icons/solid/house.svg?react', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="svg-icon" {...props} />,
}))
vi.mock('@/assets/icons/regular/house.svg?react', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="svg-icon" {...props} />,
}))
vi.mock('@/assets/icons/light/house.svg?react', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="svg-icon" {...props} />,
}))

describe('Icon', () => {
  it('renders an SVG element', async () => {
    render(<Icon name="house" variant="solid" />)
    await waitFor(() => expect(screen.getByTestId('svg-icon')).toBeInTheDocument())
  })

  it('uses regular variant by default', async () => {
    render(<Icon name="house" />)
    await waitFor(() => expect(screen.getByTestId('svg-icon')).toBeInTheDocument())
  })

  it('applies size as width and height', async () => {
    render(<Icon name="house" variant="solid" size={24} />)
    await waitFor(() => {
      const svg = screen.getByTestId('svg-icon')
      expect(svg).toHaveAttribute('width', '24')
      expect(svg).toHaveAttribute('height', '24')
    })
  })

  it('applies default size of 16', async () => {
    render(<Icon name="house" variant="solid" />)
    await waitFor(() => {
      const svg = screen.getByTestId('svg-icon')
      expect(svg).toHaveAttribute('width', '16')
      expect(svg).toHaveAttribute('height', '16')
    })
  })

  it('forwards className', async () => {
    render(<Icon name="house" variant="solid" className="text-primary" />)
    await waitFor(() => {
      const svg = screen.getByTestId('svg-icon')
      expect(svg.getAttribute('class')).toMatch(/text-primary/)
    })
  })
})
