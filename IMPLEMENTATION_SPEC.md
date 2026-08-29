# Implementation Specification — `@getbirthchart/sdk` v0.1.0

## 1. Objective

Build the official TypeScript/JavaScript SDK for GetBirthChart:

```text
@getbirthchart/sdk
```

The SDK is a thin, strongly typed client for the GetBirthChart HTTP API.

It must provide a developer experience comparable to mature npm SDKs:

- TypeScript-first
- predictable public API
- minimal dependencies
- structured errors
- generated declaration files
- ESM-first distribution
- tree-shakeable exports
- reliable tests
- semantic versioning
- npm provenance-ready publishing
- clear documentation and examples

The backend is the calculation source of truth.

The SDK must not independently implement Swiss Ephemeris or astrology geometry.

---

## 2. Repository

Recommended repository:

```text
https://github.com/getbirthchart-com/getbirthchart-js
```

Recommended package:

```text
@getbirthchart/sdk
```

Initial version:

```text
0.1.0
```

Recommended description:

```text
Official TypeScript SDK for the GetBirthChart astrology calculation API.
```

Use a separate repository from:

- the GetBirthChart web application
- `gbc-astro-engine`
- the Python package

Reasons:

1. Independent npm versioning.
2. Independent release history.
3. Smaller clone and dependency graph.
4. Cleaner issues and pull requests for SDK consumers.
5. Easier npm provenance and GitHub Actions publishing.
6. Clear package identity for external developers.
7. The SDK is an integration client, not the calculation engine.

---

## 3. Non-goals for v0.1

Do **not** implement in v0.1:

- AI interpretations
- Ask AI
- PDF generation
- yearly forecast
- transits
- solar returns
- React components
- Web Components
- chart-wheel rendering
- local Swiss Ephemeris calculations
- duplicated astrology rules
- caching framework
- CLI tooling

These can be considered after the core SDK stabilizes.

---

## 4. Runtime

Target:

```text
Node.js >= 20
```

Use native `fetch`.

The core client should remain browser-compatible where technically possible.

Do not add Axios unless there is a demonstrated requirement.

---

## 5. Distribution

Primary module format:

```text
ESM
```

Generate `.d.ts` declarations.

Preferred package exports:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

Dual CJS output is optional. Do not add compatibility complexity without a concrete need.

Set:

```json
{
  "sideEffects": false
}
```

when implementation confirms imports have no side effects.

---

## 6. Tooling

Recommended:

- TypeScript
- tsup
- Vitest
- ESLint
- Prettier

Required commands:

```bash
npm run build
npm run test
npm run test:coverage
npm run lint
npm run typecheck
npm run format
npm run format:check
```

A clean checkout must pass:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

---

## 7. Repository structure

```text
getbirthchart-js/
├── src/
│   ├── client.ts
│   ├── config.ts
│   ├── errors.ts
│   ├── http.ts
│   ├── types/
│   │   ├── common.ts
│   │   ├── chart.ts
│   │   ├── planets.ts
│   │   ├── aspects.ts
│   │   ├── synastry.ts
│   │   ├── uncertainty.ts
│   │   └── index.ts
│   └── index.ts
├── tests/
│   ├── client.test.ts
│   ├── errors.test.ts
│   ├── chart.test.ts
│   ├── unknown-time.test.ts
│   └── fixtures/
├── examples/
│   ├── birth-chart.ts
│   ├── big-three.ts
│   ├── unknown-birth-time.ts
│   ├── planetary-positions.ts
│   └── synastry.ts
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── publish.yml
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── eslint.config.js
├── README.md
├── IMPLEMENTATION_SPEC.md
├── API_CONTRACT.md
├── ERROR_MODEL.md
├── TESTING.md
├── PUBLISHING.md
├── RELEASE_CHECKLIST.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CHANGELOG.md
└── LICENSE
```

---

## 8. Client construction

Public API:

```ts
import { GetBirthChart } from "@getbirthchart/sdk";

const client = new GetBirthChart({
  apiKey: process.env.GETBIRTHCHART_API_KEY,
});
```

Configuration:

```ts
export interface GetBirthChartOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  fetch?: typeof globalThis.fetch;
}
```

Defaults:

- `baseUrl`: official production API URL
- `timeout`: 30 seconds
- `fetch`: `globalThis.fetch`

Allow `baseUrl` override for local, CI and staging environments.

Allow `fetch` injection for tests.

Never log API keys.

Never include API keys in URLs.

---

## 9. Authentication

Preferred API authentication:

```http
Authorization: Bearer gbc_xxx
```

The exact backend contract must be confirmed before release.

Anonymous operation is allowed only for endpoints explicitly supported by the API.

The SDK must not silently invent or persist credentials.

---

## 10. Public API — v0.1

Implement only:

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

Detailed contracts are defined in `API_CONTRACT.md`.

---

## 11. Unknown birth-time rules

These rules are mandatory.

When the user does not know birth time:

1. Input must contain `unknownTime: true`.
2. Do not substitute noon.
3. Do not synthesize an Ascendant.
4. Do not synthesize houses.
5. Do not turn uncertain Moon data into a false single precise answer.
6. Preserve backend uncertainty metadata.
7. Do not claim applying/separating status when the backend does not support it for the supplied data.
8. Fail closed when the backend indicates a calculation is unavailable.

The SDK should faithfully expose backend semantics rather than reinterpret them.

---

## 12. Type system

Public types must avoid `any`.

Suggested core types:

```ts
export type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type PlanetName =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export interface BirthDataInput {
  date: string;
  time?: string;
  place?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  unknownTime?: boolean;
}

export interface PlanetPlacement {
  planet: PlanetName;
  sign: ZodiacSign;
  degree: number;
  longitude: number;
  latitude?: number;
  house?: number;
  retrograde?: boolean;
}

export interface Aspect {
  body1: string;
  body2: string;
  type: string;
  orb: number;
  applying?: boolean;
}

export interface Ascendant {
  sign: ZodiacSign;
  degree: number;
  longitude?: number;
}

export interface ChartMetadata {
  engineVersion: string;
  ephemeris?: string;
  houseSystem?: string;
  zodiac?: string;
}

export interface BirthChart {
  planets: PlanetPlacement[];
  aspects: Aspect[];
  ascendant?: Ascendant;
  houses?: House[];
  birthTimeKnown: boolean;
  uncertainty?: ChartUncertainty;
  metadata: ChartMetadata;
}
```

Do not force these exact field names if the actual backend contract differs. First audit the API and build an explicit mapping layer.

---

## 13. HTTP layer

Create one internal request abstraction.

Responsibilities:

- base URL joining
- headers
- JSON serialization
- timeout / AbortController
- response parsing
- API error translation
- request IDs if returned
- safe credential handling

Do not duplicate HTTP logic across every method.

Pseudo-interface:

```ts
request<TResponse>(
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<TResponse>
```

Do not expose the HTTP layer publicly unless required later.

---

## 14. Timeouts

Default:

```text
30,000 ms
```

Use `AbortController`.

Timeouts must throw a typed SDK error.

Never leave indefinitely hanging requests.

---

## 15. Retries

v0.1 should be conservative.

Do not retry non-idempotent requests automatically unless semantics are known to be safe.

If retry behavior is introduced:

- only retry safe transient failures
- use bounded exponential backoff
- respect `Retry-After`
- never produce unbounded retry loops

It is acceptable for v0.1 to have no automatic retries.

---

## 16. Runtime validation

TypeScript types do not validate runtime network responses.

At minimum validate structural assumptions at the API boundary where malformed responses would create dangerous or misleading SDK state.

Do not add a large validation dependency unless it materially improves reliability.

Never silently coerce clearly invalid astrology values.

---

## 17. Error model

All SDK errors extend:

```ts
GetBirthChartError
```

Required subclasses:

```ts
AuthenticationError
RateLimitError
ValidationError
BirthTimeRequiredError
LocationNotFoundError
AmbiguousLocationError
TimeoutError
ApiError
```

See `ERROR_MODEL.md`.

---

## 18. Developer ergonomics

Methods should accept a single object parameter.

Prefer:

```ts
client.getMoonSign({
  date: "1992-07-20",
  time: "03:30",
  place: "London, UK",
});
```

Avoid:

```ts
client.getMoonSign("1992-07-20", "03:30", "London, UK");
```

This gives room for backwards-compatible additions.

---

## 19. Method aliases

Do not create many aliases in v0.1.

Keep one canonical name per operation.

Avoid simultaneously publishing:

```text
birthChart()
calculateChart()
natalChart()
getBirthChart()
calculateBirthChart()
```

Use:

```text
calculateBirthChart()
```

only.

---

## 20. Raw positions

`getPlanetPositions()` should expose calculation data useful to developers without requiring them to consume a full interpretation-oriented object.

Example:

```ts
const positions = await client.getPlanetPositions({
  date: "1990-01-15",
  time: "12:00",
  place: "New York, NY",
});
```

Return at least:

- body name
- longitude
- sign
- sign degree

Return latitude / speed / retrograde only if reliably supplied by the API.

Do not fabricate missing fields.

---

## 21. Metadata

Where the backend exposes it, preserve:

- engine version
- ephemeris/library version
- zodiac mode
- house system
- calculation timestamp or API version
- request ID

Metadata is part of GetBirthChart's transparency model.

Do not hard-code engine versions in the SDK.

---

## 22. Logging

The SDK must not log by default.

No:

```ts
console.log(...)
console.error(...)
```

from normal SDK execution.

Consumers control logging.

Never log:

- API keys
- full authorization headers
- sensitive birth data

---

## 23. Security

Follow `SECURITY.md`.

Key principles:

- no credential logging
- no credential persistence
- no eval
- no dynamic remote code
- minimal dependencies
- lockfile committed
- GitHub Actions pinned or responsibly versioned
- dependency review before releases

---

## 24. Testing

Required coverage areas:

- successful client construction
- auth header behavior
- base URL overrides
- request serialization
- timeout behavior
- API error mapping
- malformed response handling
- known-time birth chart
- unknown-time birth chart
- missing houses when time is unknown
- missing Ascendant when time is unknown
- Moon uncertainty propagation
- Rising-sign birth-time requirement
- synastry request mapping
- no secret leakage in errors

Use mocked HTTP for unit tests.

Do not make normal test runs depend on live production API availability.

See `TESTING.md`.

---

## 25. CI

Pull request CI should run:

```text
install
lint
typecheck
test
build
```

Use Node 20 at minimum.

Optionally test the package against the next supported Node LTS.

Publishing must be a separate workflow.

---

## 26. npm publishing

Publish from CI, not from a developer laptop, once the package is stable.

Prefer npm trusted publishing / provenance where available.

The release workflow must ensure:

1. CI passes.
2. version is correct.
3. changelog is updated.
4. package contents are inspected.
5. Git tag matches npm version.
6. release originates from the official repository.
7. provenance is enabled where supported.

See `PUBLISHING.md`.

---

## 27. README requirements

README must include:

1. package purpose
2. installation
3. 10-line quick start
4. authentication
5. birth chart example
6. unknown-time example
7. Big Three example
8. planetary positions example
9. synastry example
10. errors
11. TypeScript support
12. links to API docs
13. links to methodology
14. repository link
15. license
16. security reporting link

Avoid marketing-heavy copy.

Make the first screen useful to developers.

---

## 28. Versioning

Use Semantic Versioning.

During `0.x`:

- keep changes deliberate
- document breaking changes
- avoid casual public API churn

Examples:

```text
0.1.0 initial public SDK
0.1.1 bug fix
0.2.0 additive API expansion / potentially early-stage API changes
1.0.0 stable public contract
```

---

## 29. Acceptance criteria for v0.1.0

v0.1.0 is complete only when:

- [ ] package installs cleanly with npm
- [ ] TypeScript import works
- [ ] ESM import works
- [ ] all 8 public methods exist
- [ ] public method types are explicit
- [ ] no astrology calculations are duplicated locally
- [ ] structured errors work
- [ ] unknown-time rules are preserved
- [ ] test suite passes
- [ ] typecheck passes
- [ ] lint passes
- [ ] build passes
- [ ] package tarball contains only intended files
- [ ] README examples compile
- [ ] CI is green
- [ ] publishing workflow is configured
- [ ] no API key is present in repository history
- [ ] npm metadata points to official GetBirthChart properties
- [ ] changelog contains `0.1.0`
- [ ] license is explicitly selected

Do not publish until every required item is satisfied.
