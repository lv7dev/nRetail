import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('associates label with input via htmlFor/id', () => {
    render(<Input label="Email" id="email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email')
  })

  it('does not render label when label prop is omitted', () => {
    render(<Input placeholder="Search..." />)
    expect(screen.queryByText(/./)).toBeNull()
  })

  it('renders error message', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('applies error border styling when error prop is set', () => {
    render(<Input error="Required" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toMatch(/border-destructive/)
  })

  it('applies default border when no error', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input.className).toMatch(/border-border/)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('forwards className', () => {
    render(<Input className="w-full" />)
    expect(screen.getByRole('textbox').className).toMatch(/w-full/)
  })
})
