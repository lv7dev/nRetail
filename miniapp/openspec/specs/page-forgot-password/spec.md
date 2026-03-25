## ADDED Requirements

### Requirement: ForgotPassword page renders a phone input
The ForgotPassword page SHALL render a form with a phone input (`type="tel"`) and a submit button. All strings SHALL come from i18n.

#### Scenario: Phone field is present
- **WHEN** the ForgotPassword page renders
- **THEN** a phone input and a submit button are in the DOM

### Requirement: ForgotPassword form validates phone
On submit, the ForgotPassword form SHALL validate that phone matches `/^0[0-9]{9}$/`. A validation error SHALL display below the field if invalid.

#### Scenario: Invalid phone shows error
- **WHEN** user submits with phone "0123"
- **THEN** a phone validation error is visible

### Requirement: ForgotPassword form submits on Enter key
Pressing Enter in the phone field SHALL submit the form.

#### Scenario: Enter key triggers submission
- **WHEN** user presses Enter in the phone field
- **THEN** the form submit handler is called

### Requirement: Successful submission navigates to OTP page with forgot flow
After stub submission, the ForgotPassword page SHALL navigate to `/otp` passing `{ flow: 'forgot', phone }` via router state.

#### Scenario: Navigation to OTP after forgot-password submission
- **WHEN** the form submits successfully (stub)
- **THEN** the browser navigates to `/otp` with `state.flow === 'forgot'`

### Requirement: ForgotPassword page has a link back to Login
The page SHALL render a link to `/login`. The link text SHALL come from i18n.

#### Scenario: Back to login link navigates
- **WHEN** user clicks the back-to-login link
- **THEN** the browser navigates to `/login`
