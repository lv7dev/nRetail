# No Capability Spec Changes

This change contains no new capabilities and no modified spec-level requirements.

The `scrollable-page` spec already mandates that "The indicator disappears when `isRefreshing` returns to `false`." This change wires the existing contract correctly in `useHomeRefresh` and `HomePage` — it is an implementation fix, not a requirement change.
