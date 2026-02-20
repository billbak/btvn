# Plan: Fix README.md Issues

## Todo
- [x] 1. Line 3: Clarify Metaplex UMI SDK usage (not Metaplex CLI/Sugar)
- [x] 2. Line 5: Fix typo "liquiduity" → "liquidity"
- [x] 3. Line 11: Add missing `- ` bullet prefix
- [x] 4. Add Node.js as a prerequisite
- [x] 5. Add `npm install` step before `create-metadata.mjs` usage
- [x] 6. Line 131: Fix `spl-token balance` argument (should be mint address)
- [x] 7. Lines 167-178: Wrap in code block and replace hardcoded addresses with placeholders
- [x] 8. Line 180: Move closing paragraph outside the last section with a horizontal rule

## Review

All changes were made to `README.md` only. Summary:

- **Accuracy**: Clarified that the Metaplex UMI SDK was used (not the CLI/Sugar). Fixed `spl-token balance` to take `<TOKEN_ID>` (mint address) instead of `<RECIPIENT_ID>`.
- **Completeness**: Added Node.js prerequisite section with `brew install node`. Added `npm install` step before the metadata script usage. Wrapped the bare `spl-token account-info` output in a fenced code block. Added `---` separator before the closing paragraph so it's not visually trapped inside the "Verify on chain" section.
- **Formatting**: Fixed "liquiduity" typo to "liquidity". Fixed bullet prefix on "Claude Code" list item (was `  -` instead of `- `). Replaced two hardcoded addresses (`3VaizTk...`, `TokenkegQ...`) with `<ACCOUNT_ADDRESS>` and `<PROGRAM_ADDRESS>` placeholders for consistency.

All code blocks are properly fenced and placeholder style is consistent throughout.
