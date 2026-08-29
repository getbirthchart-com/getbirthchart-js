# Error Model

All errors thrown by `@getbirthchart/sdk` must inherit from a common base class.

```ts
export class GetBirthChartError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly requestId?: string;
  readonly cause?: unknown;
}
```

Exact implementation may vary.

## Required errors

### `AuthenticationError`

Use for:

- invalid API key
- missing API key where required
- unauthorized request

Typical HTTP status:

```text
401 / 403
```

### `RateLimitError`

Use for:

```text
429
```

Expose retry metadata when available:

```ts
retryAfter?: number;
```

### `ValidationError`

Use for invalid public input or backend validation failure.

Examples:

- invalid date
- invalid coordinate
- contradictory time flags
- missing required location data

### `BirthTimeRequiredError`

Use when an operation requires a precise birth time.

Primary example:

```ts
client.getRisingSign({
  date: "1990-01-15",
  place: "New York, NY",
  unknownTime: true,
});
```

Must fail instead of guessing.

### `LocationNotFoundError`

Use when location resolution returns no valid match.

### `AmbiguousLocationError`

Use when the backend requires the caller to disambiguate a location.

If safe and available, expose candidate metadata.

### `TimeoutError`

Use when client timeout expires.

Do not expose API credentials in the error.

### `ApiError`

Fallback for server/API errors not represented by a more specific class.

Suggested fields:

```ts
status?: number;
code?: string;
requestId?: string;
```

## Error handling example

```ts
import {
  BirthTimeRequiredError,
  RateLimitError,
} from "@getbirthchart/sdk";

try {
  await client.getRisingSign({
    date: "1990-01-15",
    place: "New York, NY",
    unknownTime: true,
  });
} catch (error) {
  if (error instanceof BirthTimeRequiredError) {
    // Ask the user for a birth time.
  }

  if (error instanceof RateLimitError) {
    // Apply caller-defined retry behavior.
  }
}
```

## Security requirements

Error messages must never include:

- API keys
- Authorization headers
- raw secrets
- unrelated response headers

Avoid embedding complete birth payloads in error messages by default.
