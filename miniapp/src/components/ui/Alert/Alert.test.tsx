import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'

describe('Alert', () => {
  it('renders the message', () => {
    render(<Alert message="Invalid phone" />)
    expect(screen.getByText('Invalid phone')).toBeInTheDocument()
  })

  it('renders with error variant by default', () => {
    render(<Alert message="Error" />)
    expect(screen.getByRole('alert').className).toMatch(/bg-destructive|destructive/)
  })

  it('renders with success variant', () => {
    render(<Alert variant="success" message="Done" />)
    expect(screen.getByRole('alert').className).toMatch(/bg-success|success/)
  })

  it('renders with info variant', () => {
    render(<Alert variant="info" message="Info" />)
    expect(screen.getByRole('alert').className).toMatch(/bg-primary|primary/)
  })

  it('renders nothing when message is empty string', () => {
    const { container } = render(<Alert message="" />)
    expect(container.firstChild).toBeNull()
  })

  it('forwards className', () => {
    render(<Alert message="Err" className="mt-2" />)
    expect(screen.getByRole('alert').className).toMatch(/mt-2/)
  })
})
