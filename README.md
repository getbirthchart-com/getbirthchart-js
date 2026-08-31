# @getbirthchart/sdk

Official TypeScript SDK `0.2.0` for the GetBirthChart astrology calculation
API. The SDK is a thin HTTP client: calculation and uncertainty semantics remain
owned by the backend.

## Installation

```bash
npm install @getbirthchart/sdk@0.2.0
```

The package currently resolves from the npm registry as `0.2.0`; this
documentation update does not publish or republish the package. For a source
checkout, use `npm ci` followed by `npm run build` instead of assuming a local
registry package.

## Quick start

The current API requires explicit coordinates and an IANA timezone. `place` is an optional caller-side label and is not geocoded by this API.

```ts
import { GetBirthChart, type BirthDataInput } from "@getbirthchart/sdk";

const apiKey = process.env.GETBIRTHCHART_API_KEY;
const client = new GetBirthChart(apiKey ? { apiKey } : {});
const chart = await client.calculateBirthChart({
  date: "1990-01-15",
  time: "12:00",
  place: "New York, NY",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
});

console.log(chart.planets, chart.ascendant, chart.aspects);
```

The request maps directly to the `gbc-astro` 1.13.0 HTTP contract. Omit the
calculation options to retain the legacy defaults:

`Tropical · Placidus · True Node · Standard · Chiron on · Lilith off`

When needed, `BirthDataInput` supports the public API options for `houseSystem`,
`nodeType`, `aspectPreset`, `customAspectRules`, `additionalPoints`, `zodiac`,
`ayanamsa`, `fold`, and `altitudeM`. Sidereal requests require an ayanamsa;
Lahiri is the recommended product choice. Custom aspects require rules using
`exactAngle` and `orb` in degrees.

The calculation options are passed through without changing the backend's
semantics:

```ts
const input: BirthDataInput = {
  date: "1992-11-03",
  time: "14:35:00",
  latitude: 21.0285,
  longitude: 105.8542,
  timezone: "Asia/Ho_Chi_Minh",
  houseSystem: "whole_sign",
  nodeType: "mean",
  aspectPreset: "extended",
  additionalPoints: ["mean_lilith", "vertex"],
};

const chart = await client.calculateBirthChart(input);
console.log(chart.metadata.houseSystem, chart.metadata.nodeType, chart.points);
```

For a Custom aspect profile, provide the complete rule list. The backend
returns a `custom-v1:` identifier followed by the full 64-character digest;
the SDK does not truncate it:

```ts
const customChart = await client.calculateBirthChart({
  ...input,
  aspectPreset: "custom",
  customAspectRules: [
    { type: "conjunction", exactAngle: 0, orb: 6 },
    { type: "opposition", exactAngle: 180, orb: 7 },
  ],
});
console.log(customChart.metadata.aspectProfile);
```

## Authentication and configuration

Pass the server-side API credential as `apiKey`. It is sent only as an `Authorization: Bearer ...` header to the configured `baseUrl`. The client does not log or persist credentials. A custom injected `fetch` can observe the URL, headers, API key, and body because it is controlled by the caller; it is not a security boundary.

```ts
const client = new GetBirthChart({
  ...(process.env.GETBIRTHCHART_API_KEY
    ? { apiKey: process.env.GETBIRTHCHART_API_KEY }
    : {}),
  baseUrl: "https://api.getbirthchart.com", // HTTPS staging or localhost HTTP only
  timeout: 30_000,
});
```

## Unknown birth time

Unknown time must be explicit. Do not pass a placeholder time. The SDK sends `local_time: null` and does not expose backend-dependent Ascendant or houses.

```ts
const chart = await client.calculateBirthChart({
  date: "1990-01-15",
  place: "New York, NY",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
  unknownTime: true,
});

console.log(chart.ascendant); // undefined
console.log(chart.houses); // undefined
```

`getRisingSign()` throws `BirthTimeRequiredError` for unknown time. Moon results are only definite when the backend provides sufficient evidence; otherwise `uncertainty.ambiguous` is true.

The mapped chart also preserves the engine-authoritative
`unknownTimeAssessment` when the response supplies it. Its midnight value is a
labeled local-day calculation anchor, not an inferred birth time. Exact
longitude remains uncertain; Ascendant, houses, Vertex, and Part of Fortune
are unavailable without a reliable birth time.

## Other operations

```ts
const bigThree = await client.getBigThree(input);
const positions = await client.getPlanetPositions(input);
const sun = await client.getSunSign(input);
const moon = await client.getMoonSign(input);
const rising = await client.getRisingSign(input);
const aspects = await client.calculateAspects(input);
const synastry = await client.calculateSynastry({ personA: input, personB: otherInput });
const composite = await client.calculateComposite({ personA: input, personB: otherInput });
const davison = await client.calculateDavison({ personA: input, personB: otherInput });
```

The client exposes these methods:

`calculateBirthChart`, `getPlanetPositions`, `getSunSign`, `getMoonSign`,
`getRisingSign`, `getBigThree`, `calculateAspects`, `calculateSynastry`,
`calculateComposite`, and `calculateDavison`.

The response types expose natal schema `1.9.0`, synastry schema `1.5.0`,
composite schema `1.3.0`, and Davison schema `1.1.0`. Compatible additive
fields are preserved in `raw`; an incompatible major schema fails closed.
HTTP natal responses may omit `calculationHash`. The SDK does not require it,
and preserves it without truncation when the server returns it.

The core defaults are Tropical, Placidus, True Node, Standard aspects, Chiron
on, and Lilith off. Sidereal/Lahiri, Mean Node, Extended/Custom aspects, and
additional points are core/API capabilities; the SDK only forwards them and
does not expose a separate calculation engine.

## Errors

All thrown errors extend `GetBirthChartError` and expose `code`, `status`, and, when supplied by the server, `requestId`.

```ts
import { BirthTimeRequiredError, RateLimitError } from "@getbirthchart/sdk";

try {
  await client.getRisingSign(input);
} catch (error) {
  if (error instanceof BirthTimeRequiredError) {
    // Ask for a reliable birth time.
  } else if (error instanceof RateLimitError) {
    console.log(error.retryAfter);
  }
}
```

Exported error types include `AuthenticationError`, `RateLimitError`, `ValidationError`, `BirthTimeRequiredError`, `LocationNotFoundError`, `AmbiguousLocationError`, `TimeoutError`, and `ApiError`.

## TypeScript and runtime

The package is ESM-first, ships declaration files, uses native `fetch`, targets Node.js 20+, and has no runtime dependencies. A custom `fetch` implementation can be injected for tests or non-Node runtimes.

The types are handwritten at the response boundary and are validated against
the published OpenAPI contract from the core `v1.13.0` tag. The contract source
is [the core API model](https://github.com/getbirthchart-com/gbc-astro-engine/blob/v1.13.0/src/gbc_astro/api/models.py).

- Website: https://getbirthchart.com/
- Developer documentation: https://getbirthchart.com/developers
- Methodology: https://getbirthchart.com/methodology
- Repository: https://github.com/getbirthchart-com/getbirthchart-js
- Core contract tag: https://github.com/getbirthchart-com/gbc-astro-engine/tree/v1.13.0
- Core GitHub release: https://github.com/getbirthchart-com/gbc-astro-engine/releases/tag/v1.13.0
- PyPI core package: https://pypi.org/project/gbc-astro/1.13.0/
- Core concept DOI: https://doi.org/10.5281/zenodo.22052875
- Core version DOI: https://doi.org/10.5281/zenodo.22206006
- OpenAPI source: https://github.com/getbirthchart-com/gbc-astro-engine/blob/v1.13.0/src/gbc_astro/api/models.py
- Security: [SECURITY.md](./SECURITY.md)

## License

MIT. See [LICENSE](./LICENSE).
