## ADDED Requirements

### Requirement: All work happens on feature branches
Developers (including AI agents) SHALL never push code directly to `main`. Every change SHALL be made on a dedicated branch.

#### Scenario: Starting new work
- **WHEN** a developer begins a new feature, fix, or chore
- **THEN** a new branch is created following the naming convention: `feature/<name>`, `fix/<name>`, or `chore/<name>`

#### Scenario: AI agent starts a task
- **WHEN** Claude Code is asked to implement a feature or fix
- **THEN** Claude creates a branch before writing any code and never pushes directly to `main`

### Requirement: Changes merge to main via pull request
All changes to `main` SHALL go through a pull request. Direct pushes to `main` are prohibited.

#### Scenario: Feature complete
- **WHEN** work on a branch is complete
- **THEN** a pull request is opened targeting `main` (not a direct push)

#### Scenario: CI must pass before merge
- **WHEN** a pull request is open against `main`
- **THEN** all required CI status checks must pass before the PR can be merged

### Requirement: Branch protection enforces the workflow on GitHub
The `main` branch on GitHub SHALL have protection rules that prevent direct pushes and require CI to pass.

#### Scenario: Direct push to main is rejected
- **WHEN** anyone (including admins) attempts to push directly to `main`
- **THEN** GitHub rejects the push

#### Scenario: PR with failing CI cannot be merged
- **WHEN** the required CI status check is failing on a PR
- **THEN** the GitHub merge button is disabled

### Requirement: Branches are deleted after merge
Feature branches SHALL be deleted after the PR is merged to keep the repository clean.

#### Scenario: Post-merge cleanup
- **WHEN** a PR is merged to `main`
- **THEN** the feature branch is deleted (via GitHub's "Delete branch" button or auto-delete setting)
