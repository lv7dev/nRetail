## 1. Fix tsconfig.json

- [x] 1.1 Remove `"ignoreDeprecations": "6.0"` from `miniapp/tsconfig.json`
- [x] 1.2 Change `"moduleResolution": "node"` to `"moduleResolution": "bundler"` in `miniapp/tsconfig.json`

## 2. Verify

- [x] 2.1 Run `tsc --noEmit` in `miniapp/` and confirm exit 0 with no errors
