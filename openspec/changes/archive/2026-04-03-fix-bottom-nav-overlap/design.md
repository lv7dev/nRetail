## Context

`AppLayout` renders a `position: fixed` `BottomNav` at `bottom: var(--zaui-safe-area-inset-bottom, 0px)`. The `page-content` div has no bottom padding, so content scrolls behind the nav and is permanently obscured. Additionally, `ThemeSwitcher` and `LanguageSwitcher` live in the `AppLayout` header, adding UI noise to every authenticated screen — the user wants these controls in the Account page only.

Current layout:
```
div.app-shell
├── div.absolute (header: outlet name + switchers)
├── div.page-content   ← no bottom padding, scrolls under nav
└── nav.fixed          ← overlaps last ~54px of content
```

## Goals / Non-Goals

**Goals:**
- Page content never visually hidden behind the BottomNav
- BottomNav height measurement is accurate regardless of future style changes
- No first-render layout flash
- ThemeSwitcher and LanguageSwitcher removed from AppLayout
- Spec updated to reflect the new ThemeSwitcher placement contract

**Non-Goals:**
- Restructuring the layout from fixed to flex-column (deferred — valid alternative but larger change)
- Moving ThemeSwitcher/LanguageSwitcher to a dedicated Settings page (that's a separate task)
- Changing BottomNav tab structure or routing behavior

## Decisions

### 1. ResizeObserver in BottomNav sets `--bottom-nav-height` on `:root`

**Decision**: `BottomNav` owns a `ref` and a `useEffect` that creates a `ResizeObserver`. On every size change (practically only fires once on mount for a static nav), it writes `document.documentElement.style.setProperty('--bottom-nav-height', '${height}px')`. `AppLayout` consumes `var(--bottom-nav-height)` for `paddingBottom`.

**Why BottomNav, not AppLayout**: The component that owns its height should be the one measuring it. AppLayout would need to either reach into BottomNav's DOM or lift state — both are worse coupling.

**Alternatives considered**:
- *Magic number in CSS* (`--bottom-nav-height: 3.5rem` in `app.css`): Works today but drifts silently if `py-2` or icon size changes. Rejected for fragility.
- *Flex-column layout* (`app-shell: height:100vh; page-content: flex:1; overflow-y:auto`): Structurally clean, no numbers at all. Deferred — requires removing `position:fixed` from BottomNav, which is a larger layout refactor with more test surface.

### 2. Fallback value `3.5rem` prevents first-render flash

`AppLayout` uses: `paddingBottom: 'calc(var(--bottom-nav-height, 3.5rem) + var(--zaui-safe-area-inset-bottom, 0px))'`

Before the ResizeObserver fires (first paint), `var(--bottom-nav-height)` is undefined so the `3.5rem` fallback applies. Since the actual nav height is ~54px (3.375rem), 3.5rem slightly over-pads by ~2px on first frame — imperceptible, corrects on frame 2.

### 3. Safe area is added on top of nav height

The BottomNav is positioned with `bottom: var(--zaui-safe-area-inset-bottom, 0px)`, meaning the nav sits above the safe area, not within it. `--bottom-nav-height` measures the nav's own height only. The `paddingBottom` calc adds both to fully clear the nav's visual extent.

## Risks / Trade-offs

- **ResizeObserver fires async** → First frame uses fallback. Mitigation: `3.5rem` fallback is close enough (≤2px over) to be invisible.
- **`document.documentElement.style.setProperty` is a global side effect** → Acceptable because `--bottom-nav-height` is a layout token used only for this clearance. If multiple nav instances existed (they don't), the last one would win.
- **Tests need mocking** → `ResizeObserver` is not available in jsdom. A `vi.stubGlobal('ResizeObserver', ...)` mock is required in the BottomNav test. The CSS variable behavior is tested by asserting the mock callback was called with expected arguments.
