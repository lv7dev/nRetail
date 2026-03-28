'use strict';

/**
 * Custom Jest transform that wraps ts-jest and inserts `/* istanbul ignore next *\/`
 * before every `__decorate(` assignment in the compiled JavaScript output.
 *
 * Why this exists:
 *   TypeScript with `emitDecoratorMetadata: true` emits `__decorate([..., __metadata("design:paramtypes",
 *   [typeof (_a = typeof DepClass !== "undefined" && DepClass) === "function" ? _a : Object])])` for
 *   every injectable class. The `? _a : Object` ternary is an architecturally unreachable "false" branch
 *   (imported classes are always defined and are always functions). Istanbul reports it as uncovered.
 *
 *   The `/* istanbul ignore next *\/` comment must appear in the compiled JavaScript *immediately before*
 *   the `__decorate(` statement, not inside the class body. Since TypeScript provides no source-level
 *   syntax to emit a comment at exactly that position, this transform post-processes the compiled output.
 */

const { TsJestTransformer } = require('ts-jest');

const tsJestTransformer = new TsJestTransformer({ tsconfig: { removeComments: false } });

// Matches any __decorate([ call:
//   - Class decorators:    `exports.Foo = Foo = __decorate([`
//   - Method/prop decorators: `__decorate([` (no exports prefix)
//   - tslib variants of either form
// Does NOT match the helper definition: `var __decorate = (this && ...`
const DECORATE_PATTERN = /(\n(?:exports\.[A-Za-z_$][A-Za-z_$0-9]* = [A-Za-z_$][A-Za-z_$0-9]* = )?(?:[A-Za-z_$][A-Za-z_$0-9]*\.)?__decorate\(\[)/g;

module.exports = {
  process(sourceText, sourcePath, options) {
    const result = tsJestTransformer.process(sourceText, sourcePath, options);
    if (!result || typeof result.code !== 'string') return result;

    const patched = result.code.replace(
      DECORATE_PATTERN,
      '\n/* istanbul ignore next */$1',
    );

    return { ...result, code: patched };
  },

  getCacheKey(fileData, filePath, options) {
    const base = tsJestTransformer.getCacheKey(fileData, filePath, options);
    return base + '_istanbul_phantom_fix_v2';
  },
};
