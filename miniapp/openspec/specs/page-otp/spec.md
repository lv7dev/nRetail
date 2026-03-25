## ADDED Requirements

### Requirement: OTP page requires flow context from router state
The OTP page SHALL read `location.state` for `{ flow: 'register' | 'forgot', phone: string }`. If state is missing or invalid, it SHALL redirect to `/login`.

#### Scenario: Missing state redirects to login
- **WHEN** user navigates to `/otp` directly without router state
- **THEN** the browser redirects to `/login`

#### Scenario: Valid state renders the OTP form
- **WHEN** user arrives at `/otp` with `state = { flow: 'forgot', phone: '0901234567' }`
- **THEN** the OTP page renders with the phone number displayed

### Requirement: OTP page renders a 6-digit OtpInput
The OTP page SHALL render `<OtpInput length={6} onComplete={...} />`. No manual submit button is needed.

#### Scenario: OtpInput is rendered
- **WHEN** the OTP page renders with valid state
- **THEN** a 6-digit OTP input is present

### Requirement: OTP auto-submits when all 6 digits are filled
When `OtpInput` calls `onComplete`, the OTP page SHALL immediately submit (stub: 1s delay) without requiring a button press.

#### Scenario: Completing 6 digits triggers submission
- **WHEN** the user fills all 6 OTP boxes
- **THEN** the submission handler is called automatically

### Requirement: OTP page navigates based on flow after verification
After successful (stub) verification:
- `flow === 'forgot'` → navigate to `/new-password` with `{ phone }` state
- `flow === 'register'` → set mock user in auth store and navigate to `/`

#### Scenario: Forgot flow navigates to new-password
- **WHEN** OTP is verified and `flow === 'forgot'`
- **THEN** the browser navigates to `/new-password`

#### Scenario: Register flow logs user in and navigates home
- **WHEN** OTP is verified and `flow === 'register'`
- **THEN** `useAuthStore().user` is set and the browser navigates to `/`

### Requirement: OTP page has a Resend Code action
The OTP page SHALL render a "Resend code" button/link. On click it SHALL show an `Alert` (success variant) confirming the code was resent (stub). All strings SHALL come from i18n.

#### Scenario: Resend shows success feedback
- **WHEN** user clicks "Resend code"
- **THEN** a success Alert is visible

### Requirement: OTP page displays all strings via i18n
Every visible string SHALL come from the `auth` i18n namespace.

#### Scenario: Phone hint uses i18n with interpolation
- **WHEN** the OTP page renders in Vietnamese
- **THEN** the phone number is displayed within an i18n-formatted string
