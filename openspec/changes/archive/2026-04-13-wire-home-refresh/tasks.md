## 1. Wire onRefresh in HomePage

- [x] 1.1 In `miniapp/src/pages/home/index.tsx`, replace `onRefresh={() => console.log('refresh')}` with `onRefresh={refetch}` on `<ScrollablePage>`

## 2. Update Tests

- [x] 2.1 In `miniapp/src/pages/home/index.test.tsx`, verify that the `refetch` function from `useHomeRefresh` is passed as `onRefresh` to `ScrollablePage` (mock `useHomeRefresh` and assert the prop)
