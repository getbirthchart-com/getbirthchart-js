# Backend API audit for SDK v0.1.0

Audited against `gbc-astro-engine` HTTP adapter, its vendored OpenAPI contract, and the web application's integration docs.

| SDK operation | Backend endpoint | Wire request | SDK mapping |
| --- | --- | --- | --- |
| `calculateBirthChart` | `POST /v1/charts/natal` | `NatalChartRequest` | Canonical `bodies/angles/houses/aspects` → `planets/ascendant/houses/aspects` |
| `getPlanetPositions` | `POST /v1/charts/natal` | `NatalChartRequest` | Returns mapped `bodies` as `positions` |
| `getSunSign` | `POST /v1/charts/natal` | `NatalChartRequest` | Extracts `bodies.sun` |
| `getMoonSign` | `POST /v1/charts/natal` | `NatalChartRequest` | Extracts `bodies.moon`; unknown-time result fails closed unless the backend supplies explicit certainty |
| `getRisingSign` | `POST /v1/charts/natal` | `NatalChartRequest` | Extracts `angles.ascendant`; unknown time fails before network |
| `getBigThree` | `POST /v1/charts/natal` | `NatalChartRequest` | Extracts Sun, Moon, and optional Ascendant |
| `calculateAspects` | `POST /v1/charts/natal` | `NatalChartRequest` | Returns server-owned `aspects`; phase maps to `applying` only when reliable |
| `calculateSynastry` | `POST /v1/charts/synastry` | `RelationshipRequest` | `chartA/chartB` summaries + `crossAspects` |

## Confirmed backend behavior

- Production base URL configured by the web app: `https://api.getbirthchart.com`.
- Calculation routes accept `Authorization: Bearer <secret>`; the backend calls this an internal shared secret, while the SDK exposes it as `apiKey`.
- Natal input requires `local_date`, `timezone`, `latitude`, and `longitude`. Known time requires `local_time`; unknown time requires `local_time: null` and `unknown_time: true`.
- Unknown-time natal responses contain no angles and no houses, and `derived.bigThree.rising` is null.
- Server errors use `{ error: { code, message, field, details } }`.
- Synastry response contains full `chartA` and `chartB` plus cross-chart facts.

## Mismatches and deliberate adaptations

1. The public SDK draft allows `place` to be resolved by GetBirthChart, but the audited backend has no geocoding field or location endpoint. The SDK therefore accepts `place` only as a local label when explicit coordinates and timezone are also supplied; it never transmits or resolves the string.
2. The public draft suggests a generic `ChartUncertainty` and `MoonUncertainty`, but the current natal response only exposes unknown-time status through `subject.birthTimeKnown`, empty angles/houses, and warnings. The SDK does not infer a Moon interval. For unknown time without explicit server certainty it omits `MoonSignResult.sign` and marks the result ambiguous.
3. The canonical backend uses lower-case sign/body identifiers and fields such as `degreeInSign`, `a`, `b`, and `phase`; the SDK normalizes these into the public names while retaining the backend metadata and raw relationship payload.
4. The current backend does not return a documented request ID. The SDK reads `x-request-id` or `request-id` if a deployment/proxy supplies one and exposes it in metadata/errors.

The SDK does not add local astrology calculations, geocoding, retries, interpretation, forecasts, or UI behavior to bridge these gaps.
