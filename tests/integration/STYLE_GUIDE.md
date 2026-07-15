# Integration Test Style Guide

This describes the target structure for `tests/integration/` going forward — the existing suite
(`helpers/`, `client/`, `payPeriod/`, `timesheet/`, `payrollReport/`) predates this and will be rebuilt
to match it operation by operation, not migrated wholesale.

---

## Strategy

Unit tests (`tests/unit/`) already cover pure logic exhaustively with mocks — every branch of
`resolveFolder`, every edge case of `buildAllocationRows`, etc. Integration tests exist for a narrower,
different job: **prove the real wiring works** — that a request really reaches the live Google Sheets/Drive
API, that a thrown `NotFoundError`/`UnprocessableError` really becomes the right HTTP status through the
real Express app, that a write really persists so a subsequent read sees it. They're expensive (quota,
wall-clock time) and small in number by design — don't use them to re-prove logic units already cover.

Two consequences that shape everything below:

- **Every scenario should earn its place.** A scenario that duplicates what a unit test already proves,
  without adding "and this really works against live Sheets/Drive," isn't worth the quota. See the
  Tier 1/Tier 2 split under Scenario Registry.
- **Rate limiting is not your problem.** `sheetsLimiter`/`driveLimiter`/`oauthDriveLimiter`
  (`src/utils/rateLimiters/`) already wrap every real adapter call — calls queue automatically instead of
  erroring past quota. Never add manual `setTimeout`/delay logic in a test or builder; if you find yourself
  reaching for one, something's wrong upstream, not here.

---

## Folder & file layout

```
tests/integration/
  builders/                  — one function per file, each hits the real API and returns the created
                                entity. Shared across every operation folder — this is how a scenario
                                for createEmployee gets a valid client to attach to, for example.
    createTestClient.ts
    createTestEmployee.ts
    ...
  teardown/                  — delete-only utilities, hit Drive/Sheets directly (the real app has no
                                delete endpoints for most of these entities). Never wired into afterAll —
                                always run manually, on demand. See "Teardown" below.
    sweepTestDataFolder.ts
  scenarioTypes.ts           — the shared Scenario<TInput> interface, imported by every scenarios.ts
  createClient/
    scenarios.ts             — the scenario registry for this operation
    createClient.test.ts     — the generic table-driven test file
  createEmployee/
    scenarios.ts
    createEmployee.test.ts
  ...                        — one folder per operation under test
  setup.ts                   — unchanged, still loads .env
```

**One folder per operation, not per resource.** `createClient` and (eventually) `updateClient` each get
their own folder rather than sharing a `client/` folder — each operation's scenario set and test file are
substantial enough to stand alone, and it keeps a folder name mapping 1:1 to the service function it tests.

---

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Operation folder | Exact name of the service function under test | `createClient/` for `services/client/createClient.ts` |
| Scenario label | `<operationName>_<condition>`, camelCase | `createClient_duplicateClientCode` |
| Builder function | `createTest<Entity>` | `createTestClient` |
| Teardown function | `delete<Entity>`/`sweep<Thing>` | `sweepTestDataFolder` |
| Test file | `<operationName>.test.ts` | `createClient.test.ts` |

**No numeric IDs** (`01_01`, etc.) — decided against. A label like `createClient_duplicateClientCode` is
self-documenting in test output, grep, and stack traces; a number requires a lookup table to mean anything
and creates renumbering churn the moment a scenario is inserted in the middle. If a generated doc wants a
position number for human scanning, it's derived from array order at generation time, never hand-typed or
depended on by code.

---

## The scenario registry pattern

Every operation folder's `scenarios.ts` exports an array of the shared `Scenario<TInput>` shape
(`tests/integration/scenarioTypes.ts`):

```ts
interface Scenario<TInput> {
  label: string;
  description: string;       // one sentence, human-readable — this is what the generated doc shows
  input: TInput;
  expectedStatus: number;
  assert?: (response: Response) => void;  // anything beyond the status code
}
```

**Scenarios needing a real precondition** (an existing entity to collide with, or an existing folder to
link to) use top-level `await` at the top of `scenarios.ts` to set that precondition up for real, once,
before the array is built — this project is real ESM (`"type": "module"`, every import uses `.js`), so
this works natively; no change to the `Scenario<TInput>` shape is needed, and the generic test file stays
exactly as simple as if every `input` were static.

`createClient/scenarios.ts` example (two of the nine):

```ts
import createTestClient from '../builders/createTestClient.js';

// Runs once, before any test in this file — a real client to collide with below.
const existingClient = await createTestClient({ clientCode: 'DUPE_TEST' });

const scenarios: Scenario<Partial<ClientCreateRequest>>[] = [
  {
    label: 'createClient_newFolderTree',
    description: 'Creates a client with every folder/file provisioned fresh.',
    input: buildNewFolderTreeRequest(),
    expectedStatus: 201,
    assert: (res) => {
      expect(res.body.clientId).toBeDefined();
      expect(res.body.payrollConfigFileId).toBeDefined();
    },
  },
  {
    label: 'createClient_duplicateClientCode',
    description: 'Fails with 422 when a Payroll Config file already exists for the client code.',
    input: buildRequestReusingClientCode(existingClient.clientCode, existingClient.payrollConfigFolderId),
    expectedStatus: 422,
  },
];

export default scenarios;
```

**Tier the scenarios mentally, even though they live in one array**: scenarios that create real
Drive/Sheets infrastructure (costs quota) vs. scenarios that fail before any real API call (validation
errors — free, but still worth having as real HTTP-level proof, not just unit coverage). No code
distinction needed — this is a judgment call when deciding whether a new scenario is worth adding.

**Every non-2xx scenario must assert on the response body, not just `expectedStatus`.** Several distinct
failure branches share the same status code (422 covers `duplicateClientCode`, `duplicatePayPeriodRegistry`,
`missingRootFolderLink`, `folderInputMissingBoth`, and `folderNameCollision` for `createClient` alone) —
status-only would still pass if the code started throwing the wrong one of these for the wrong reason.
`assert` stays optional in the type only so success scenarios without anything extra to check aren't forced
to write a no-op; any scenario with `expectedStatus >= 400` should assert on `res.body.message` (or
whatever distinguishes it) in practice.

---

## The generic test file pattern

Every `<operationName>.test.ts` is thin — it doesn't know scenario details, it just drives the registry:

```ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import scenarios from './scenarios.js';

describe('POST /api/v1/client', () => {
  it.each(scenarios)('$label', async ({ input, expectedStatus, assert }) => {
    const res = await request(app).post('/api/v1/client').send(input);
    expect(res.status).toBe(expectedStatus);
    assert?.(res);
  });
});
```

If a scenario needs setup (e.g. an existing client to collide with), that setup happens in `input`'s
construction function inside `scenarios.ts` — calling a `builders/` function — not in the test file.

---

## Builder conventions

- One function per file, always returns the created entity.
- Every builder that creates Drive resources anchors them under `TEST_DATA_ROOT_FOLDER_ID` (`.env`) —
  either directly or by passing it down as `rootFolderLink`. This is a hard rule: it's what makes the
  sweep-teardown model work. A builder that links to something outside that folder breaks teardown
  silently.
- Builders make real API calls — no mocking. They're the same functions a future seed script would use
  to build a UI-testing dataset.

---

## Teardown

Manual only — nothing in this suite auto-deletes anything, ever (confirmed: no `afterAll` cleanup hooks).
`teardown/sweepTestDataFolder.ts` matches the `Clients` sheet rows whose `EmployeePayrollFolderId` sits
inside `TEST_DATA_ROOT_FOLDER_ID`, deletes those rows, then deletes the whole Drive folder (which cascades
to every file/subfolder inside it). Run it yourself, whenever you want a clean slate — not tied to test
runs.

---

## Documentation

Scenario lists are **generated, not hand-maintained** — same reasoning as `docs/openapi.json` being
generated from route JSDoc rather than hand-written (see `docs/ARCHITECTURE.md`'s note on why the old
hand-written route list drifted). A script (TBD, same shape as `exportSwagger.ts`) will import every
`scenarios.ts` and emit a markdown table. Don't hand-edit that output; edit `scenarios.ts` and regenerate.

---

## Adding a new operation

1. Create `tests/integration/<operationName>/`
2. Read the actual service function — enumerate every real branch (success shapes + thrown errors), the
   way `createClient`'s 9 scenarios were derived from reading `createClient.ts`/`resolveFolder.ts`/
   `parseDriveLink.ts` directly, not guessed
3. Write `scenarios.ts` against `Scenario<TInput>`
4. Write `<operationName>.test.ts` using the generic `it.each` pattern above
5. Add any new builder(s) needed to `builders/`, anchored under `TEST_DATA_ROOT_FOLDER_ID`
6. Regenerate the scenario doc
