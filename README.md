# @getbirthchart/sdk

Official TypeScript SDK for the GetBirthChart astrology calculation API. The SDK is a thin HTTP client: calculation and uncertainty semantics remain owned by the backend.

## Installation

```bash
npm install @getbirthchart/sdk
```

## Quick start

The current API requires explicit coordinates and an IANA timezone. `place` is an optional caller-side label and is not geocoded by this API.

```ts
import { GetBirthChart } from "@getbirthchart/sdk";

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

## Other operations

```ts
const bigThree = await client.getBigThree(input);
const positions = await client.getPlanetPositions(input);
const sun = await client.getSunSign(input);
const moon = await client.getMoonSign(input);
const rising = await client.getRisingSign(input);
const aspects = await client.calculateAspects(input);
const synastry = await client.calculateSynastry({ personA: input, personB: otherInput });
```

The v0.1 client exposes exactly these eight methods:

`calculateBirthChart`, `getPlanetPositions`, `getSunSign`, `getMoonSign`, `getRisingSign`, `getBigThree`, `calculateAspects`, and `calculateSynastry`.

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

See [API_CONTRACT.md](./API_CONTRACT.md), [IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md), and [API_AUDIT.md](./API_AUDIT.md).

- Website: https://getbirthchart.com/
- Developer documentation: https://getbirthchart.com/developers
- Methodology: https://getbirthchart.com/methodology
- Repository: https://github.com/getbirthchart-com/getbirthchart-js
- Security: [SECURITY.md](./SECURITY.md)

## License

MIT. See [LICENSE](./LICENSE).
