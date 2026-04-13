## 1. Update tests (RED first)

- [x] 1.1 Add test: default `cardOverlap=32` → topZone `paddingBottom: 32px`, card shell `marginTop: -32px`
- [x] 1.2 Add test: custom `cardOverlap={48}` → topZone `paddingBottom: 48px`, card shell `marginTop: -48px`
- [x] 1.3 Add test: no card → no `paddingBottom` on topZone, no card shell rendered
- [x] 1.4 Add test: default `cardRadius` → topZone has `rounded-b-3xl` class when card present
- [x] 1.5 Add test: custom `cardRadius="rounded-b-xl"` → topZone has `rounded-b-xl`, not `rounded-b-3xl`
- [x] 1.6 Add test: no card → no radius class on topZone

## 2. Update prop interface

- [x] 2.1 Add `cardOverlap?: number` to `CollapsibleHeaderProps` (default `32`)
- [x] 2.2 Add `cardRadius?: string` to `CollapsibleHeaderProps` (default `'rounded-b-3xl'`)
- [x] 2.3 Destructure both props with defaults in the function signature

## 3. Update implementation

- [x] 3.1 Add `import { cn } from '@/utils/cn'` to the component file
- [x] 3.2 Replace `topZoneCardClasses` string variable and template-literal `className` with `cn('relative overflow-hidden bg-primary', renderedCard && cardRadius)`
- [x] 3.3 Add `style={renderedCard ? { paddingBottom: \`${cardOverlap}px\` } : undefined}` to the topZone div
- [x] 3.4 Replace `className="relative px-4 mt-[-32px]"` on the card shell with `className={cn('relative px-4')}` and `style={{ marginTop: \`-${cardOverlap}px\` }}`

## 4. Verify and format

- [x] 4.1 Run `npm run test` in `miniapp/` — all tests green including the new ones
- [x] 4.2 Run `npx prettier --write miniapp/src/components/shared/CollapsibleHeader/CollapsibleHeader.tsx`
- [x] 4.3 Confirm home page visual is unchanged (card overlap looks identical at default values)
