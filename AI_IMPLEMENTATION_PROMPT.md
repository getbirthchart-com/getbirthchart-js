# AI Coding Agent Prompt — Implement `@getbirthchart/sdk` v0.1.0

You are implementing the official GetBirthChart TypeScript SDK.

## Mandatory first step

Before changing code:

1. inspect the repository
2. inspect all specification files
3. inspect the existing GetBirthChart backend/API contracts
4. identify the real production/staging endpoints
5. identify authentication behavior
6. identify known-time and unknown-time response schemas
7. identify existing error payloads
8. identify synastry support
9. report any mismatch between the backend and this SDK specification

Do not invent server behavior.

## Source of truth

Read and follow:

1. `IMPLEMENTATION_SPEC.md`
2. `API_CONTRACT.md`
3. `ERROR_MODEL.md`
4. `TESTING.md`
5. `PUBLISHING.md`
6. `RELEASE_CHECKLIST.md`

If documentation and backend behavior conflict, preserve backend correctness and explicitly document the mismatch before adapting the SDK contract.

## Product objective

Implement:

```text
@getbirthchart/sdk v0.1.0
```

as a thin TypeScript HTTP SDK.

Do not port or duplicate astrology calculations from Python.

## Required public methods

Implement exactly:

```ts
calculateBirthChart()
getPlanetPositions()
getSunSign()
getMoonSign()
getRisingSign()
getBigThree()
calculateAspects()
calculateSynastry()
```

Do not add AI reading, Ask AI, forecasts, transits, solar returns, UI components or chart rendering.

## Required design

- TypeScript-first
- Node 20+
- ESM-first
- native fetch
- injectable fetch
- 30s default timeout
- minimal dependencies
- no default logging
- typed errors
- object arguments
- build declarations
- tree-shakeable exports
- testable without production network

## Critical astrology safety contract

Unknown birth time must fail closed.

Never:

- insert noon
- guess the Ascendant
- guess houses
- convert an ambiguous Moon interval into a definite sign
- calculate astrology geometry locally to fill missing API values

Preserve backend uncertainty exactly.

## Implementation sequence

### Phase 1 — API audit

Document:

- endpoints
- methods
- auth
- request schemas
- response schemas
- errors
- metadata
- unknown-time behavior

Create an internal mapping table between backend endpoint fields and SDK public fields.

### Phase 2 — package foundation

Create:

- `package.json`
- TypeScript config
- build config
- lint/format config
- source layout
- tests
- CI

### Phase 3 — transport

Implement one internal HTTP client with:

- base URL
- headers
- auth
- timeout
- AbortController
- safe JSON parsing
- request ID propagation
- structured error mapping

### Phase 4 — types

Create explicit public types.

No public `any`.

### Phase 5 — methods

Implement the eight approved public methods.

Every method must delegate calculations to the GetBirthChart API.

### Phase 6 — tests

Add mocks/fixtures for:

- normal known birth time
- unknown stable Moon
- unknown ambiguous Moon
- missing Rising
- missing houses
- auth errors
- rate limit
- validation errors
- timeout
- malformed response
- synastry
- secret leakage regression

### Phase 7 — documentation

Update README with runnable examples.

Examples must be consistent with actual implemented types.

### Phase 8 — package validation

Run:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

Create a tarball and install it into a clean temporary project.

Verify both JavaScript and TypeScript imports.

### Phase 9 — release readiness

Do not publish automatically unless explicitly instructed.

Return:

1. files changed
2. API audit findings
3. tests added
4. command results
5. remaining blockers
6. release checklist status

## Quality bar

Do not mark the task complete if:

- any required check fails
- public types use avoidable `any`
- README examples do not match actual code
- unknown-time behavior is unsafe
- npm tarball contains unintended files
- package metadata is incomplete
- credentials appear anywhere in repository files
