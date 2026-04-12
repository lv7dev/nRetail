## ADDED Requirements

### Requirement: App shell hides scrollbar during scroll
The app shell SHALL NOT display a visible scrollbar at any time. The `body` element SHALL have `scrollbar-width: none` (Firefox) and `::-webkit-scrollbar { display: none }` (Chrome/Safari/WebKit) applied globally in `app.css`.

#### Scenario: No scrollbar visible while scrolling
- **WHEN** the user scrolls through page content
- **THEN** no scrollbar SHALL be rendered on the screen
