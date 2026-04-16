## Why

`ScrollablePage` assigns `scrollContainerRef.current` inside a `useEffect`. React runs effects bottom-up (children before parents), so descendant components that depend on this ref — specifically `TabbedViewPanels`'s passive scroll listener — find it `null` when their own `useEffect` runs, and silently skip setup. The scroll listener is never attached, `lastKnownScrollTopRef` stays `0`, and switching back to a tab always restores scroll to the top of the page.

## What Changes

- Move `scrollContainerRef.current = internalRef.current` in `ScrollablePage` from `useEffect` to `useLayoutEffect`
- All `useLayoutEffect`s complete before any `useEffect` fires, so descendants reading `outerScrollRef.current` in their `useEffect` will always find it set

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `scrollable-page`: Add a requirement that `scrollContainerRef` is assigned before passive effects run (i.e. in `useLayoutEffect`), so descendant components can rely on it during their own `useEffect`

## Impact

- **Modified**: `miniapp/src/components/shared/ScrollablePage/ScrollablePage.tsx` — one-word change: `useEffect` → `useLayoutEffect` for the ref assignment
- **Modified**: `miniapp/src/components/shared/ScrollablePage/ScrollablePage.test.tsx` — verify timing expectation if tested
- No public API or prop changes; no new dependencies
