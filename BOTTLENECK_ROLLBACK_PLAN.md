# Bottleneck Rate Limiter — Rollback Plan

Temporary document. Delete once the 30-file review is done and you're comfortable keeping this work.

There is no git repo here (`git status` confirms `not a git repository`), so this document is the only
safety net — there's no `git revert` to fall back on. Everything below was verified against the actual
current file contents (via `grep`), not recalled from memory, immediately before writing this.

## What this work is

Adds a client-side rate limiter (`bottleneck`) so Sheets/Drive API calls queue instead of erroring past
Google's quota. First attempt (a `Proxy`-based wrapper around the 3 client-factory files) was broken and
fully reverted — see "Dead end" below. Current, live design: each of the 20 real adapter files that make
an API call wraps that one call in `<limiter>.schedule(() => ...)` directly. Confirmed working against the
live API (folder-existence check succeeded through `oauthDriveLimiter`).

## Full file inventory

**New files (3)** — delete these to fully remove:
- `src/utils/rateLimiters/sheetsLimiter.ts`
- `src/utils/rateLimiters/driveLimiter.ts`
- `src/utils/rateLimiters/oauthDriveLimiter.ts`

**Dependency:**
- `package.json` — added `"bottleneck": "^2.19.5"` to `dependencies`
- `package-lock.json` — updated accordingly by `npm install`

**Config (2 files, small additions):**
- `src/config/constants.ts` (lines 97–104) — added `GOOGLE_API_RATE_LIMIT_PER_MINUTE = 60` and
  `GOOGLE_API_RATE_LIMIT_WINDOW_MS = 60 * 1000`, plus a comment block above them
- `vitest.config.ts` (line 29) — added `testTimeout: 120_000` inside the `integration` project block,
  plus a 4-line comment above it

**Env (2 files) — NOT part of the rate limiter, do not touch on rollback:**
- `.env` — `GOOGLE_OAUTH_REFRESH_TOKEN` was refreshed (old one was expired/revoked — unrelated fix) and
  `TEST_DATA_ROOT_FOLDER_ID` was added (for the test-data-folder work, not the rate limiter)
- `.env-example` — `TEST_DATA_ROOT_FOLDER_ID=` placeholder added
- Rolling back the rate limiter should leave both of these exactly as they are.

**Touched, then fully reverted — currently byte-identical to their original state, no action needed:**
- `src/db/adapter/getSheetsClient.ts`
- `src/db/adapter/getDriveClient.ts`
- `src/db/adapter/getOAuthDriveClient.ts`
- (These briefly held the broken `Proxy` wrapper. Confirmed via `grep` just now: zero references to
  `rateLimiter` or `wrapClientWithLimiter` remain in any of the three.)

**Deleted during the fix, does not exist anymore — nothing to roll back:**
- `src/utils/wrapClientWithLimiter.ts` (the broken recursive-Proxy wrapper — created, used, then deleted
  in the same session after it crashed on a real `drive.files.get` call)

**Modified — the 20 real adapter files, each wraps exactly one (or two) real API calls:**

| File | Limiter used | # calls wrapped |
|---|---|---|
| `appendRow.ts` | `sheetsLimiter` | 1 |
| `applyFormattingRequests.ts` | `sheetsLimiter` | 1 |
| `clearTabContent.ts` | `sheetsLimiter` | 1 |
| `createTab.ts` | `sheetsLimiter` | 1 |
| `deleteRow.ts` * | `sheetsLimiter` | 2 |
| `deleteTab.ts` * | `sheetsLimiter` | 2 |
| `getSheetId.ts` | `sheetsLimiter` | 1 |
| `listTabNames.ts` | `sheetsLimiter` | 1 |
| `overwriteTabRows.ts` | `sheetsLimiter` | 1 |
| `readTab.ts` | `sheetsLimiter` | 1 |
| `readTabValues.ts` | `sheetsLimiter` | 1 |
| `readTabs.ts` | `sheetsLimiter` | 1 |
| `renameTab.ts` * | `sheetsLimiter` | 2 |
| `reorderTabs.ts` | `sheetsLimiter` | 2 |
| `tabExists.ts` | `sheetsLimiter` | 1 |
| `updateCells.ts` | `sheetsLimiter` | 1 |
| `writeValues.ts` | `sheetsLimiter` | 1 |
| `createWorkbook.ts` | `driveLimiter` | 1 |
| `createFolder.ts` | `oauthDriveLimiter` | 1 |
| `createOAuthWorkbook.ts` | `oauthDriveLimiter` | 1 |
| `driveChildExists.ts` | `oauthDriveLimiter` | 1 |
| `folderExists.ts` | `oauthDriveLimiter` | 1 |

\* = also has a small extra change beyond the wrap — see "Special cases" below.

## How to roll back completely

1. **Remove the dependency**: `npm uninstall bottleneck` (reverts `package.json` + `package-lock.json`)
2. **Delete the 3 new files**: `rm src/utils/rateLimiters/sheetsLimiter.ts src/utils/rateLimiters/driveLimiter.ts src/utils/rateLimiters/oauthDriveLimiter.ts` (then `rmdir src/utils/rateLimiters` if empty)
3. **Revert `src/config/constants.ts`**: delete the `// ─── Google API Rate Limits ───` comment block and
   the two `export const GOOGLE_API_RATE_LIMIT_*` lines (currently lines 97–104)
4. **Revert `vitest.config.ts`**: delete the `testTimeout: 120_000` line and its 4-line comment
   (currently around line 24–29), leaving `fileParallelism: false,` as the last line before the closing
   brace, matching the file's state before this work
5. **Revert each of the 20 adapter files** — for every file in the table above:
   - Remove the import line: `import sheetsLimiter from '#utils/rateLimiters/sheetsLimiter.js';`
     (or `driveLimiter` / `oauthDriveLimiter`, matching the table)
   - Unwrap every `<limiter>.schedule(() => <expr>)` back to plain `<expr>` — i.e. delete
     `<limiter>.schedule(() => ` from the front of the call and its matching `)` from the end
6. **Special cases** — `deleteRow.ts`, `deleteTab.ts`, `renameTab.ts` each got one extra line added
   (`const sheetId = tab.properties.sheetId;`) to work around a TypeScript narrowing issue caused by
   referencing `tab.properties.sheetId` inside the new closure. To fully revert these three:
   - Remove the `const sheetId = tab.properties.sheetId;` line
   - Change every bare `sheetId` reference inside the (now-unwrapped) request body back to
     `tab.properties.sheetId`
7. **Verify**: `npm run typecheck` and `npm test` — should match the pre-bottleneck baseline: clean
   typecheck, 295/295 unit tests passing (this exact count was confirmed on the last clean run before
   this document was written).

## Dead end (already cleaned up, documented here for context only)

The first implementation wrapped the 3 client-factory files (`getSheetsClient.ts`, `getDriveClient.ts`,
`getOAuthDriveClient.ts`) in a recursive `Proxy` (`wrapClientWithLimiter.ts`) so every method call on the
returned googleapis client was transparently rate-limited. This crashed on the first real call
(`drive.files.get`) with `TypeError: 'get' on proxy: property 'files' is a read-only and non-configurable
data property...` — googleapis defines nested resource properties as non-configurable/non-writable, which
a `Proxy`'s `get` trap is spec-required to return unmodified. That approach was fully reverted (all 3
factory files back to original, `wrapClientWithLimiter.ts` deleted) before the current per-adapter-file
design was built. Nothing from this dead end remains in the codebase — listed here only so the history
makes sense if you're reviewing diffs against your own memory of the conversation.
