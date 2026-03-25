import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordInput } from './PasswordInput'

// Mock Icon to avoid dynamic SVG imports in tests
vi.mock('@/components/ui/Icon/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

describe('PasswordInput', () => {
  it('renders a password input hidden by default', () => {
    render(<PasswordInput />)
    expect(screen.queryByRole('textbox', { hidden: true }) ?? document.querySelector('input')).toBeTruthy()
    const input = document.querySelector('input[type="password"]')
    expect(input).toBeInTheDocument()
  })

  it('toggle reveals the password', async () => {
    render(<PasswordInput />)
    const toggle = screen.getByRole('button')
    await userEvent.click(toggle)
    const input = document.querySelector('input[type="text"]')
    expect(input).toBeInTheDocument()
  })

  it('toggle hides password again', async () => {
    render(<PasswordInput />)
    const toggle = screen.getByRole('button')
    await userEvent.click(toggle)
    await userEvent.click(toggle)
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('shows eye-slash icon when password is hidden', () => {
    render(<PasswordInput />)
    expect(screen.getByTestId('icon-eye-slash')).toBeInTheDocument()
  })

  it('shows eye icon when password is visible', async () => {
    render(<PasswordInput />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByTestId('icon-eye')).toBeInTheDocument()
  })

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<PasswordInput ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
