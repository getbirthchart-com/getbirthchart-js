# Contributing

Thank you for contributing to the official GetBirthChart JavaScript/TypeScript SDK.

## Development

Requirements:

```text
Node.js >= 20
npm
```

Install:

```bash
npm ci
```

Run checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Scope

This repository is the SDK client.

Do not implement Swiss Ephemeris or astrology calculation rules here.

Calculation behavior belongs to the backend / engine.

SDK contributions should focus on:

- HTTP client behavior
- TypeScript types
- API mapping
- errors
- developer ergonomics
- tests
- examples
- documentation

## Public API changes

Public methods and types are versioned API.

Before adding or renaming a public method:

1. explain the use case
2. confirm backend support
3. evaluate compatibility
4. update API contract
5. add tests
6. update changelog

Avoid aliases and duplicate ways to perform the same operation.

## Testing

No normal unit test may require the production GetBirthChart API.

Use injected/mocked fetch.

Optional integration testing must be explicitly enabled.

## Unknown birth time

Changes touching unknown birth-time behavior require dedicated tests.

Never:

- assume noon
- invent an Ascendant
- invent houses
- flatten ambiguous Moon results into false precision

## Style

Prefer:

- explicit types
- small functions
- clear naming
- minimal dependencies
- object parameters for public functions

Avoid:

- `any` in public interfaces
- hidden global state
- implicit logging
- unnecessary abstractions

## Pull requests

A PR should include:

- concise problem statement
- implementation summary
- tests
- docs for public changes
- changelog entry when relevant
