## ADDED Requirements

### Requirement: Login page renders phone and password fields
The Login page SHALL render a form with a phone number input (`type="tel"`) and a `PasswordInput`. Both fields SHALL have labels sourced from i18n.

#### Scenario: Phone and password fields are present
- **WHEN** the Login page renders
- **THEN** a phone input and a password input are present in the DOM

### Requirement: Login form validates phone and password
On submit, the Login form SHALL validate: phone matches `/^0[0-9]{9}$/` and password has at least 6 characters. Validation errors SHALL display below the relevant field using i18n strings.

#### Scenario: Invalid phone shows error
- **WHEN** user submits with phone "123"
- **THEN** a phone validation error message is visible

#### Scenario: Short password shows error
- **WHEN** user submits with password "abc"
- **THEN** a password validation error message is visible

### Requirement: Login form submits on Enter key
Pressing Enter while focus is in any field SHALL submit the form.

#### Scenario: Enter key triggers submission
- **WHEN** the user presses Enter in the password field
- **THEN** the form submit handler is called

### Requirement: Login page has links to Register and Forgot Password
The Login page SHALL render a link to `/register` ("Don't have an account?") and a link to `/forgot-password` ("Forgot password?"). Both SHALL use i18n strings.

#### Scenario: Register link navigates to register page
- **WHEN** user clicks the register link
- **THEN** the browser navigates to `/register`

#### Scenario: Forgot password link navigates to forgot-password page
- **WHEN** user clicks the forgot password link
- **THEN** the browser navigates to `/forgot-password`

### Requirement: Login page displays all strings via i18n
Every visible string on the Login page SHALL come from the `auth` or `common` i18n namespace. No hardcoded strings are permitted.

#### Scenario: Page title uses i18n
- **WHEN** the Login page renders in Vietnamese
- **THEN** the title displays the Vietnamese translation key value
