# Testing Standard

The SDK must be testable without calling the production API.

## Test framework

Recommended:

```text
Vitest
```

## Required test categories

### Client configuration

Test:

- default options
- custom base URL
- custom timeout
- injected fetch
- API key header

### Request mapping

For every public method verify:

- HTTP method
- path
- request body
- headers
- omission of undefined values

### Birth chart

Verify:

- normal known-time request
- valid response mapping
- metadata propagation
- houses / Ascendant present only when supplied by backend

### Unknown time

Mandatory fixtures:

1. unknown time with stable Moon
2. unknown time with ambiguous Moon
3. unknown time must not expose fabricated houses
4. unknown time must not expose fabricated Ascendant
5. Rising-sign call fails with `BirthTimeRequiredError`

### Errors

Test mapping for:

```text
400
401
403
404
409 or API-specific location ambiguity
422
429
500
503
timeout
invalid JSON
malformed success response
```

### Secrets

Add a regression test confirming thrown errors do not contain the configured API key.

### Synastry

Test:

- person A mapping
- person B mapping
- independent unknown-time semantics
- server uncertainty propagation

## Network policy

Unit tests:

```text
NO live production calls
```

Optional integration tests may call staging if explicitly enabled through environment variables.

Example:

```text
GBC_RUN_INTEGRATION_TESTS=1
GBC_API_KEY=...
GBC_API_BASE_URL=...
```

Integration tests must not run accidentally in normal CI.

## Coverage

Do not chase meaningless 100% coverage.

Required high confidence around:

- HTTP transport
- auth
- public method mapping
- errors
- uncertainty behavior

Coverage thresholds can be introduced once baseline implementation exists.

## Package smoke test

Before publishing, create the npm tarball:

```bash
npm pack
```

Install it into a clean temporary project and verify:

```ts
import { GetBirthChart } from "@getbirthchart/sdk";
```

Also verify TypeScript declarations resolve correctly.
