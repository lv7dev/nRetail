## Context

`TabbedViewPanels` manages scroll position restoration when switching tabs in outer-scroll mode. When the user switches to a tab they have never visited, the component falls back to a "scroll to top of panels" position. The original implementation had two bugs discovered during browser testing.

**Bug 1 — Timing:** `useEffect` fires after the browser has already painted the updated DOM. The sequence was:

```
1. React renders: Panel:bought → display:none, Panel:viewed → visible
2. Content height shrinks (bought items no longer occupy space)
3. scrollTop (still at old position) is clamped by browser to new max scroll
4. Browser PAINTS — user sees bottom of viewed content ← flash
5. useEffect fires — attempts scroll correction (too late)
```

**Bug 2 — Coordinate system:** `panelsRef.current.offsetTop` returns distance from the element to its `offsetParent`. The `ScrollablePage` div has no `position` other than `static`, so the `offsetParent` is a distant ancestor (possibly `<body>`). The resulting value includes the height of the `CollapsibleHeader` and other DOM ancestors that sit outside the scroll container — it is not in the same coordinate space as `outerScrollElement.scrollTop`.

## Goals / Non-Goals

**Goals:**
- Eliminate the visual flash when switching to a first-visit tab in outer mode
- Produce the correct scroll position (top of `TabbedViewPanels` visible at top of scroll container viewport)
- Remove leftover debug `console.log`

**Non-Goals:**
- Changing any public API or props
- Changing behaviour for returning tabs (save/restore path already works correctly)
- Changing self-scroll mode

## Decisions

### 1. `useLayoutEffect` instead of `useEffect`

`useLayoutEffect` fires synchronously after React commits DOM mutations, but **before** the browser paints. This closes the window where the browser would paint the wrong scroll position.

```
1. React renders: Panel:bought → display:none, Panel:viewed → visible
2. DOM committed
3. useLayoutEffect fires — scroll correction applied ← no paint has occurred yet
4. Browser PAINTS — user sees the correct position ✓
```

**Alternative considered:** `useEffect` with an immediate scroll before the first frame via `requestAnimationFrame`. Rejected — still one frame of wrong position, more complex, and `useLayoutEffect` is the standard tool for synchronous DOM measurements.

**Note:** `useLayoutEffect` in SSR environments emits a warning. This project is a Zalo Mini App (client-only) — no SSR concern.

---

### 2. `getBoundingClientRect()` instead of `offsetTop`

To scroll `TabbedViewPanels` to the top of the scroll container viewport, the correct calculation is:

```
targetScrollTop = outerScrollElement.scrollTop
                  + panelsRef.current.getBoundingClientRect().top
                  - outerScrollElement.getBoundingClientRect().top
```

**Why this works:** `getBoundingClientRect()` returns positions in viewport coordinates. The difference `panelsTop - containerTop` gives the panels' current offset from the scroll container's top edge. Adding the current `scrollTop` converts this to scroll-container scroll coordinates. This is correct regardless of `offsetParent` ancestry or intermediate transforms.

**When it is called:** Inside `useLayoutEffect`, after React has applied `display: none` to the outgoing panel. The DOM layout reflects the new state (bought hidden, viewed visible), so the `getBoundingClientRect()` values are accurate for the incoming layout.

**Alternative considered:** Walking `offsetParent` chain to accumulate total offset relative to the scroll container. Rejected — fragile, verbose, and breaks if any ancestor has `transform` applied (which resets `offsetParent`).

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `useLayoutEffect` blocks paint until scroll is set — could cause jank on slow devices | The computation is O(1) DOM reads + one write; negligible cost |
| `getBoundingClientRect()` may return `0` for `top` if called before layout | Called inside `useLayoutEffect` which runs after layout — values are always valid |
| Existing test mocks `offsetTop` via `Object.defineProperty` — test needs updating | Update test to mock `getBoundingClientRect` instead; the expected scroll value changes accordingly |
