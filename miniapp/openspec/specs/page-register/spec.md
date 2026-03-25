## ADDED Requirements

### Requirement: Register page renders phone, password, and confirm password fields
The Register page SHALL render a form with a phone input (`type="tel"`), a `PasswordInput` for password, and a `PasswordInput` for confirm password. All fields SHALL have i18n labels.

#### Scenario: All three fields are present
- **WHEN** the Register page renders
- **THEN** a phone input, a password input, and a confirm password input are in the DOM

### Requirement: Register form validates all fields
On submit, the Register form SHALL validate: phone matches `/^0[0-9]{9}$/`, password has at least 6 characters, and confirm password matches password. Errors SHALL display below the relevant field.

#### Scenario: Password mismatch shows error
- **WHEN** password is "pass123" and confirm password is "pass456"
- **THEN** a confirm-password mismatch error is visible

#### Scenario: All fields valid allows submission
- **WHEN** phone is "0901234567", password is "pass123", confirm is "pass123"
- **THEN** the submit handler is called with no validation errors

### Requirement: Register form submits on Enter key
Pressing Enter while focus is in any field SHALL submit the form.

#### Scenario: Enter key triggers submission
- **WHEN** the user presses Enter in the confirm password field
- **THEN** the form submit handler is called

### Requirement: Successful register navigates to OTP page with register flow
After stub submission, the Register page SHALL navigate to `/otp` passing `{ flow: 'register', phone }` via router state.

#### Scenario: Navigation to OTP after register
- **WHEN** the form submits successfully (stub)
- **THEN** the browser navigates to `/otp` with `state.flow === 'register'`

### Requirement: Register page has a link back to Login
The Register page SHALL render a link to `/login`. The link text SHALL come from i18n.

#### Scenario: Back to login link navigates
- **WHEN** user clicks the back-to-login link
- **THEN** the browser navigates to `/login`
