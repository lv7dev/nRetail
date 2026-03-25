## ADDED Requirements

### Requirement: NewPassword page requires phone context from router state
The NewPassword page SHALL read `location.state` for `{ phone: string }`. If state is missing, it SHALL redirect to `/login`.

#### Scenario: Missing state redirects to login
- **WHEN** user navigates to `/new-password` directly without router state
- **THEN** the browser redirects to `/login`

### Requirement: NewPassword page renders password and confirm password fields
The NewPassword page SHALL render a form with a `PasswordInput` for new password and a `PasswordInput` for confirm password. All labels SHALL come from i18n.

#### Scenario: Both password fields are present
- **WHEN** the NewPassword page renders with valid state
- **THEN** a new password input and a confirm password input are in the DOM

### Requirement: NewPassword form validates both fields
On submit, the form SHALL validate: password has at least 6 characters and confirm password matches. Errors SHALL display below the relevant field.

#### Scenario: Password mismatch shows error
- **WHEN** password is "newpass1" and confirm is "newpass2"
- **THEN** a mismatch validation error is visible

### Requirement: NewPassword form submits on Enter key
Pressing Enter in any field SHALL submit the form.

#### Scenario: Enter key triggers submission
- **WHEN** user presses Enter in the confirm password field
- **THEN** the form submit handler is called

### Requirement: Successful submission navigates to Login
After stub submission, the NewPassword page SHALL show a success `Alert` briefly, then navigate to `/login` so the user can log in with their new password.

#### Scenario: Success navigates to login
- **WHEN** the form submits successfully (stub)
- **THEN** the browser navigates to `/login`

### Requirement: NewPassword page displays all strings via i18n
Every visible string SHALL come from the `auth` i18n namespace.

#### Scenario: Page title uses i18n
- **WHEN** the NewPassword page renders in Vietnamese
- **THEN** the title displays the Vietnamese translation value
