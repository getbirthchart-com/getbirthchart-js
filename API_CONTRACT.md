# Public API Contract — `@getbirthchart/sdk` v0.1.0

This document defines the intended public SDK surface.

The implementation agent must first inspect the actual GetBirthChart backend endpoints and map this public contract onto the real server contract.

Do not invent backend fields merely to match this document.

---

# 1. Client

```ts
const client = new GetBirthChart(options);
```

```ts
export interface GetBirthChartOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  fetch?: typeof globalThis.fetch;
}
```

---

# 2. Shared birth input

Preferred public input:

```ts
export interface BirthDataInput {
  date: string;
  time?: string;
  place?: string;

  latitude?: number;
  longitude?: number;
  timezone?: string;

  unknownTime?: boolean;
}
```

## Rules

### Known time

Example:

```ts
{
  date: "1990-01-15",
  time: "12:00",
  place: "New York, NY"
}
```

### Unknown time

Example:

```ts
{
  date: "1990-01-15",
  place: "New York, NY",
  unknownTime: true
}
```

When `unknownTime === true`, do not silently transmit an invented time.

### Location

Support the backend's canonical location modes.

Possible public models:

1. Human-readable `place`, resolved by GetBirthChart.
2. Explicit `latitude`, `longitude`, `timezone`.

Do not allow conflicting location representations without deterministic validation.

---

# 3. `calculateBirthChart`

```ts
calculateBirthChart(
  input: BirthDataInput
): Promise<BirthChart>
```

Example:

```ts
const chart = await client.calculateBirthChart({
  date: "1990-01-15",
  time: "12:00",
  place: "New York, NY",
});
```

Expected response conceptually:

```ts
interface BirthChart {
  planets: PlanetPlacement[];
  aspects: Aspect[];
  ascendant?: Ascendant;
  houses?: House[];
  birthTimeKnown: boolean;
  uncertainty?: ChartUncertainty;
  metadata: ChartMetadata;
}
```

Unknown-time response must not synthesize time-dependent values.

---

# 4. `getPlanetPositions`

```ts
getPlanetPositions(
  input: BirthDataInput
): Promise<PlanetPositionsResult>
```

Purpose:

Return calculation-oriented body positions without requiring a consumer to process the full chart object.

Example:

```ts
const result = await client.getPlanetPositions({
  date: "1990-01-15",
  time: "12:00",
  place: "New York, NY",
});
```

Suggested type:

```ts
interface PlanetPositionsResult {
  positions: PlanetPlacement[];
  metadata: ChartMetadata;
  uncertainty?: ChartUncertainty;
}
```

---

# 5. `getSunSign`

```ts
getSunSign(
  input: BirthDataInput
): Promise<SignResult>
```

Suggested result:

```ts
interface SignResult {
  sign: ZodiacSign;
  degree?: number;
  longitude?: number;
  metadata?: ChartMetadata;
}
```

Do not add interpretation prose in v0.1.

---

# 6. `getMoonSign`

```ts
getMoonSign(
  input: BirthDataInput
): Promise<MoonSignResult>
```

The result must be capable of representing uncertainty.

Suggested:

```ts
interface MoonSignResult {
  sign?: ZodiacSign;
  degree?: number;
  longitude?: number;
  uncertainty?: MoonUncertainty;
  metadata?: ChartMetadata;
}
```

If the Moon may change signs within the valid unknown-time interval, expose that fact instead of selecting one sign as definitely correct.

Possible uncertainty model:

```ts
interface MoonUncertainty {
  ambiguous: boolean;
  possibleSigns?: ZodiacSign[];
  interval?: {
    start?: string;
    end?: string;
  };
}
```

The actual fields must map to backend evidence.

---

# 7. `getRisingSign`

```ts
getRisingSign(
  input: BirthDataInput
): Promise<RisingSignResult>
```

This operation requires sufficient time and location data.

If birth time is unknown, throw:

```ts
BirthTimeRequiredError
```

Do not return a guessed Rising sign.

Suggested response:

```ts
interface RisingSignResult {
  sign: ZodiacSign;
  degree: number;
  longitude?: number;
  metadata?: ChartMetadata;
}
```

---

# 8. `getBigThree`

```ts
getBigThree(
  input: BirthDataInput
): Promise<BigThreeResult>
```

Suggested known-time result:

```ts
interface BigThreeResult {
  sun: SignResult;
  moon: MoonSignResult;
  rising: RisingSignResult;
}
```

For unknown time, the design must not imply a Rising value exists.

Preferred model:

```ts
interface BigThreeResult {
  sun: SignResult;
  moon: MoonSignResult;
  rising?: RisingSignResult;
  birthTimeKnown: boolean;
  uncertainty?: ChartUncertainty;
}
```

---

# 9. `calculateAspects`

```ts
calculateAspects(
  input: BirthDataInput
): Promise<AspectsResult>
```

Suggested:

```ts
interface AspectsResult {
  aspects: Aspect[];
  metadata?: ChartMetadata;
  uncertainty?: ChartUncertainty;
}
```

Aspect:

```ts
interface Aspect {
  body1: string;
  body2: string;
  type: string;
  orb: number;
  applying?: boolean;
}
```

Only expose applying/separating if the backend reliably returns it for the supplied input.

Do not recalculate aspects locally.

---

# 10. `calculateSynastry`

Preferred method:

```ts
calculateSynastry(
  input: SynastryInput
): Promise<SynastryResult>
```

```ts
interface SynastryInput {
  personA: BirthDataInput;
  personB: BirthDataInput;
}
```

Example:

```ts
const synastry = await client.calculateSynastry({
  personA: {
    date: "1990-01-15",
    time: "12:00",
    place: "New York, NY",
  },
  personB: {
    date: "1992-07-20",
    time: "03:30",
    place: "London, UK",
  },
});
```

Suggested result:

```ts
interface SynastryResult {
  aspects: SynastryAspect[];
  personA?: BirthChartSummary;
  personB?: BirthChartSummary;
  uncertainty?: SynastryUncertainty;
  metadata?: ChartMetadata;
}
```

Do not include AI relationship interpretation in v0.1.

---

# 11. Dates and time

Use explicit string formats in the public API.

Preferred:

```text
date: YYYY-MM-DD
time: HH:mm or HH:mm:ss
```

Document accepted formats precisely.

Do not rely on JavaScript `Date` for local civil birth time unless there is a very clear contract. `Date` can accidentally introduce timezone conversion.

Prefer civil date/time strings plus location/timezone.

---

# 12. Coordinates

If explicit coordinates are accepted:

```ts
latitude: number // -90 to +90
longitude: number // -180 to +180
```

Do not infer a timezone solely from longitude.

Timezone must come from:

- backend location resolution
- explicit IANA timezone
- another verified server-side mechanism

---

# 13. House system

v0.1 should use backend defaults unless the public API already supports a house system option.

Do not add an SDK-only house-system parameter that the backend does not support.

If exposed later, use a typed option.

---

# 14. Request IDs

If API responses return a request ID, expose it in metadata or errors.

This aids debugging without leaking sensitive data.

---

# 15. Future-compatible input style

Every public method must accept one object argument.

This permits additive options without positional argument breakage.

Correct:

```ts
client.getMoonSign({
  date,
  time,
  place,
});
```

Avoid:

```ts
client.getMoonSign(date, time, place);
```
