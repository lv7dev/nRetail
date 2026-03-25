## ADDED Requirements

### Requirement: OtpInput renders N individual digit boxes
`OtpInput` SHALL accept a `length` prop (default `6`) and render that many single-character `<input>` elements displayed as a row.

#### Scenario: Six boxes render by default
- **WHEN** `<OtpInput onComplete={fn} />` is rendered
- **THEN** exactly 6 input elements are present in the DOM

### Requirement: OtpInput auto-advances focus on digit entry
When a digit (0–9) is typed in a box, `OtpInput` SHALL move focus to the next box automatically. Non-digit keystrokes SHALL be ignored.

#### Scenario: Focus advances after digit entry
- **WHEN** the user types "3" in the first box
- **THEN** focus moves to the second box

#### Scenario: Non-digit input is ignored
- **WHEN** the user types "a" in any box
- **THEN** the box value remains empty and focus does not advance

### Requirement: OtpInput handles Backspace navigation
When Backspace is pressed on an empty box, `OtpInput` SHALL move focus to the previous box and clear it.

#### Scenario: Backspace on empty box moves focus back
- **WHEN** the second box is empty and the user presses Backspace
- **THEN** focus moves to the first box

### Requirement: OtpInput handles paste
When the user pastes a string into any box, `OtpInput` SHALL extract up to `length` digit characters from the pasted value and fill all boxes starting from the first.

#### Scenario: Pasting a 6-digit string fills all boxes
- **WHEN** user pastes "123456" into any box
- **THEN** all six boxes are filled with digits 1–6

#### Scenario: Pasting a non-digit string is ignored
- **WHEN** user pastes "abcdef"
- **THEN** no boxes are filled

### Requirement: OtpInput calls onComplete when all digits are filled
When all `length` boxes contain a digit, `OtpInput` SHALL call `onComplete(code: string)` with the full code. Only digit-only codes SHALL trigger the callback.

#### Scenario: onComplete fires after last digit
- **WHEN** the user fills the sixth and final digit box
- **THEN** `onComplete` is called with the 6-character code string

#### Scenario: onComplete does not fire with partial input
- **WHEN** only 5 of 6 boxes are filled
- **THEN** `onComplete` is not called

### Requirement: OtpInput forwards className
`OtpInput` SHALL accept `className` and apply it to the container element via `cn()`.

#### Scenario: Custom className is applied
- **WHEN** `<OtpInput className="mt-4" onComplete={fn} />` is rendered
- **THEN** the container has the `mt-4` class
