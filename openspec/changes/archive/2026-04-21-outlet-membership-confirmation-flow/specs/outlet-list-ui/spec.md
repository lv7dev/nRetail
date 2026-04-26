## MODIFIED Requirements

### Requirement: Not-connected OutletItem shows membership-status-aware actions
When rendered in the Not Connected tab, `OutletItem` SHALL display actions based on `membershipStatus`:
- `PENDING`: an outlined **"Not My Outlet"** button (the reject action) and a filled **"Connect"** button (the confirm action)
- `REJECTED`: a plain **"Not My Outlet"** text label (non-interactive) and a filled **"Connect"** button only

The Connect button SHALL call `onConnect` when tapped. The "Not My Outlet" button (PENDING only) SHALL call `onReject` when tapped. Both callbacks are no-ops until wired to mutations.

#### Scenario: PENDING item shows reject button and connect button
- **WHEN** `OutletItem` is rendered with `connected={false}` and `membershipStatus="PENDING"`
- **THEN** an outlined "Not My Outlet" button and a filled "Connect" button are both visible

#### Scenario: REJECTED item shows label and connect button only
- **WHEN** `OutletItem` is rendered with `connected={false}` and `membershipStatus="REJECTED"`
- **THEN** a plain "Not My Outlet" text label is visible and only the "Connect" button is shown (no reject button)

#### Scenario: Connected item shows no action buttons
- **WHEN** `OutletItem` is rendered with `connected={true}`
- **THEN** neither the "Not My Outlet" label/button nor the Connect button are rendered

---

## ADDED Requirements

### Requirement: OutletListPage wires confirm and reject mutations
`OutletListPage` SHALL call `PATCH /outlets/:outletId/membership` when the user taps Connect (confirm) or "Not My Outlet" (reject) in the Not Connected tab. After a successful confirm, both the `connected=true` and `connected=false` query caches SHALL be invalidated. After a successful reject, the `connected=false` cache SHALL be invalidated so the item re-renders in REJECTED state.

#### Scenario: Tapping Connect confirms membership
- **WHEN** the user taps the Connect button on a PENDING or REJECTED outlet
- **THEN** `PATCH /outlets/:outletId/membership` is called with `{ action: "confirm" }`
- **AND** on success, both `connected=true` and `connected=false` query caches are invalidated

#### Scenario: Tapping "Not My Outlet" rejects membership
- **WHEN** the user taps the "Not My Outlet" button on a PENDING outlet
- **THEN** `PATCH /outlets/:outletId/membership` is called with `{ action: "reject" }`
- **AND** on success, the `connected=false` query cache is invalidated

#### Scenario: Confirmed outlet moves to Connected tab
- **WHEN** the confirm mutation succeeds and queries re-fetch
- **THEN** the outlet no longer appears in the Not Connected tab and appears in the Connected tab

#### Scenario: Rejected outlet remains in Not Connected with label only
- **WHEN** the reject mutation succeeds and the `connected=false` query re-fetches
- **THEN** the outlet remains in the Not Connected tab with `membershipStatus="REJECTED"` (label only, no reject button)
