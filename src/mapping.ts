import { ApiError, BirthTimeRequiredError, ValidationError } from "./errors";
import type {
  Aspect,
  AspectsResult,
  BirthChart,
  BigThreeResult,
  ChartMetadata,
  ChartUncertainty,
  ChartWarning,
  JsonObject,
  MoonSignResult,
  PlanetPlacement,
  PlanetPositionsResult,
  RisingSignResult,
  SignResult,
  SynastryAspect,
  SynastryResult,
  ZodiacSign,
} from "./types";
import type { BirthDataInput, SynastryInput } from "./types";

export interface NatalPayload {
  local_date: string;
  local_time: string | null;
  unknown_time: boolean;
  timezone: string;
  latitude: number;
  longitude: number;
}

const ZODIAC_SIGNS = new Set<string>([
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asObject(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value))
    throw invalidResponse(`${label} is missing or malformed.`);
  return value;
}

function asJsonObject(value: unknown): JsonObject | undefined {
  return isRecord(value) ? (value as JsonObject) : undefined;
}

function asString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0)
    throw invalidResponse(`${label} is missing or malformed.`);
  return value;
}

function asNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value))
    throw invalidResponse(`${label} is missing or malformed.`);
  return value;
}

function optionalNumber(value: unknown, label: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  return asNumber(value, label);
}

function optionalBoolean(value: unknown, label: string): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "boolean")
    throw invalidResponse(`${label} is malformed.`);
  return value;
}

function invalidResponse(message: string): ApiError {
  return new ApiError(message, { code: "INVALID_RESPONSE" });
}

function titleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function zodiacSign(value: unknown, label: string): ZodiacSign {
  const raw = asString(value, label).trim().toLowerCase();
  if (!ZODIAC_SIGNS.has(raw))
    throw invalidResponse(`${label} contains an unsupported zodiac sign.`);
  return titleCase(raw) as ZodiacSign;
}

function bodyName(value: string): string {
  return titleCase(value);
}

function warning(value: unknown, index: number): ChartWarning {
  const raw = asObject(value, `warnings[${index}]`);
  const rawJson = asJsonObject(raw);
  return {
    code: asString(raw.code, `warnings[${index}].code`),
    message: asString(raw.message, `warnings[${index}].message`),
    ...(typeof raw.severity === "string" ? { severity: raw.severity } : {}),
    ...(Array.isArray(raw.fieldsAffected)
      ? {
          fieldsAffected: raw.fieldsAffected.filter(
            (field): field is string => typeof field === "string",
          ),
        }
      : {}),
    ...(rawJson ? { raw: rawJson } : {}),
  };
}

function metadata(
  value: unknown,
  schemaVersion: unknown,
  requestId?: string,
  fallback?: ChartMetadata,
): ChartMetadata {
  const raw = isRecord(value) ? value : fallback?.raw;
  const version =
    isRecord(value) && typeof value.engineVersion === "string"
      ? value.engineVersion
      : fallback?.engineVersion;
  if (!raw || !version)
    throw invalidResponse("meta.engineVersion is missing or malformed.");
  const rawJson = asJsonObject(raw);
  return {
    engineVersion: version,
    ...(typeof raw.engine === "string" ? { engine: raw.engine } : {}),
    ...(typeof raw.ephemerisProvider === "string"
      ? { ephemerisProvider: raw.ephemerisProvider }
      : {}),
    ...(typeof raw.ephemerisDataVersion === "string"
      ? { ephemerisDataVersion: raw.ephemerisDataVersion }
      : {}),
    ...(typeof raw.timezoneDataVersion === "string"
      ? { timezoneDataVersion: raw.timezoneDataVersion }
      : {}),
    ...(typeof raw.calculationProfile === "string"
      ? { calculationProfile: raw.calculationProfile }
      : {}),
    ...(typeof raw.houseSystem === "string"
      ? { houseSystem: raw.houseSystem }
      : {}),
    ...(typeof raw.aspectProfile === "string"
      ? { aspectProfile: raw.aspectProfile }
      : {}),
    ...(typeof raw.zodiac === "string" ? { zodiac: raw.zodiac } : {}),
    ...(typeof raw.ayanamsa === "string" ? { ayanamsa: raw.ayanamsa } : {}),
    ...(typeof raw.apiVersion === "string"
      ? { apiVersion: raw.apiVersion }
      : {}),
    ...(typeof schemaVersion === "string" ? { schemaVersion } : {}),
    ...(requestId ? { requestId } : {}),
    ...(rawJson ? { raw: rawJson } : {}),
  };
}

function uncertainty(
  birthTimeKnown: boolean,
  warnings: ChartWarning[],
): ChartUncertainty | undefined {
  const reasons = warnings.map((item) => item.message);
  if (!birthTimeKnown)
    reasons.unshift("The backend marked the birth time as unknown.");
  if (birthTimeKnown && reasons.length === 0) return undefined;
  return {
    birthTimeKnown,
    reasons,
    unavailableFields: birthTimeKnown ? [] : ["ascendant", "houses"],
    ...(warnings.length > 0 ? { warnings } : {}),
  };
}

function mapPlanet(value: unknown, name: string): PlanetPlacement {
  const raw = asObject(value, `bodies.${name}`);
  const house = optionalNumber(raw.house, `bodies.${name}.house`);
  const latitude = optionalNumber(raw.latitude, `bodies.${name}.latitude`);
  const retrograde = optionalBoolean(
    raw.retrograde,
    `bodies.${name}.retrograde`,
  );
  return {
    planet: bodyName(name),
    sign: zodiacSign(raw.sign, `bodies.${name}.sign`),
    degree: asNumber(raw.degreeInSign, `bodies.${name}.degreeInSign`),
    longitude: asNumber(raw.longitude, `bodies.${name}.longitude`),
    ...(latitude !== undefined ? { latitude } : {}),
    ...(house !== undefined ? { house } : {}),
    ...(retrograde !== undefined ? { retrograde } : {}),
  };
}

function mapAspect(
  value: unknown,
  index: number,
  synastry = false,
): Aspect | SynastryAspect {
  const raw = asObject(value, `aspects[${index}]`);
  const body1 =
    typeof raw.a === "string"
      ? raw.a
      : asString(raw.body1, `aspects[${index}].body1`);
  const body2 =
    typeof raw.b === "string"
      ? raw.b
      : asString(raw.body2, `aspects[${index}].body2`);
  const phase = typeof raw.phase === "string" ? raw.phase : undefined;
  const exactAngle = optionalNumber(
    raw.exactAngle,
    `aspects[${index}].exactAngle`,
  );
  const actualAngle = optionalNumber(
    raw.actualAngle,
    `aspects[${index}].actualAngle`,
  );
  return {
    ...(synastry && typeof raw.id === "string" ? { id: raw.id } : {}),
    body1,
    body2,
    type: asString(raw.type, `aspects[${index}].type`),
    orb: asNumber(raw.orb, `aspects[${index}].orb`),
    ...(phase
      ? {
          phase,
          ...(phase === "applying" || phase === "separating"
            ? { applying: phase === "applying" }
            : {}),
        }
      : {}),
    ...(exactAngle !== undefined ? { exactAngle } : {}),
    ...(actualAngle !== undefined ? { actualAngle } : {}),
  };
}

function mapAscendant(value: unknown): NonNullable<BirthChart["ascendant"]> {
  const raw = asObject(value, "angles.ascendant");
  const longitude = optionalNumber(raw.longitude, "angles.ascendant.longitude");
  return {
    sign: zodiacSign(raw.sign, "angles.ascendant.sign"),
    degree: asNumber(raw.degreeInSign, "angles.ascendant.degreeInSign"),
    ...(longitude !== undefined ? { longitude } : {}),
  };
}

function mapHouse(
  value: unknown,
  index: number,
): NonNullable<BirthChart["houses"]>[number] {
  const raw = asObject(value, `houses[${index}]`);
  return {
    number: asNumber(raw.number, `houses[${index}].number`),
    cuspLongitude: asNumber(
      raw.cuspLongitude,
      `houses[${index}].cuspLongitude`,
    ),
    sign: zodiacSign(raw.sign, `houses[${index}].sign`),
    degree: asNumber(raw.degreeInSign, `houses[${index}].degreeInSign`),
  };
}

export function toNatalPayload(input: BirthDataInput): NatalPayload {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
    Number.isNaN(Date.parse(`${input.date}T00:00:00Z`))
  ) {
    throw new ValidationError("date must be a valid YYYY-MM-DD calendar date.");
  }
  const unknownTime = input.unknownTime === true;
  if (unknownTime && input.time !== undefined) {
    throw new ValidationError("time must be omitted when unknownTime is true.");
  }
  if (!unknownTime && input.time === undefined) {
    throw new ValidationError("time is required unless unknownTime is true.");
  }
  if (
    input.time !== undefined &&
    !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(input.time)
  ) {
    throw new ValidationError("time must use HH:mm or HH:mm:ss format.");
  }
  const hasLatitude = input.latitude !== undefined;
  const hasLongitude = input.longitude !== undefined;
  if (hasLatitude !== hasLongitude) {
    throw new ValidationError(
      "latitude and longitude must be provided together.",
    );
  }
  if (
    !hasLatitude ||
    !hasLongitude ||
    input.timezone === undefined ||
    input.timezone.trim() === ""
  ) {
    throw new ValidationError(
      input.place
        ? "The current API does not geocode place; provide latitude, longitude, and an IANA timezone alongside place."
        : "latitude, longitude, and timezone are required because the current API does not resolve locations.",
    );
  }
  const latitude = input.latitude;
  const longitude = input.longitude;
  if (
    latitude === undefined ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new ValidationError("latitude must be between -90 and 90.");
  }
  if (
    longitude === undefined ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new ValidationError("longitude must be between -180 and 180.");
  }
  if (input.place !== undefined && input.place.trim() === "") {
    throw new ValidationError("place must not be empty when provided.");
  }

  return {
    local_date: input.date,
    local_time: unknownTime ? null : (input.time ?? null),
    unknown_time: unknownTime,
    timezone: input.timezone.trim(),
    latitude,
    longitude,
  };
}

export function mapBirthChart(value: unknown, requestId?: string): BirthChart {
  const root = asObject(value, "chart");
  const subject = asObject(root.subject, "subject");
  const birthTimeKnown = subject.birthTimeKnown;
  if (typeof birthTimeKnown !== "boolean")
    throw invalidResponse("subject.birthTimeKnown is missing or malformed.");
  const rawWarnings = root.warnings === undefined ? [] : root.warnings;
  if (!Array.isArray(rawWarnings))
    throw invalidResponse("warnings is malformed.");
  const warnings = rawWarnings.map((item, index) => warning(item, index));
  const bodyObject = asObject(root.bodies, "bodies");
  const planets = Object.entries(bodyObject).map(([name, body]) =>
    mapPlanet(body, name),
  );
  const rawAngles = asObject(root.angles, "angles");
  const rawHouses = root.houses === undefined ? [] : root.houses;
  if (!Array.isArray(rawHouses)) throw invalidResponse("houses is malformed.");
  if (!isRecord(root.derived))
    throw invalidResponse("derived is missing or malformed.");
  if (!Array.isArray(root.aspects))
    throw invalidResponse("aspects is missing or malformed.");
  const chartMetadata = metadata(root.meta, root.schemaVersion, requestId);
  const chartUncertainty = uncertainty(birthTimeKnown, warnings);
  const result: BirthChart = {
    planets,
    aspects: root.aspects.map((item, index) => mapAspect(item, index)),
    birthTimeKnown,
    metadata: chartMetadata,
    ...(warnings.length > 0 ? { warnings } : {}),
    ...(chartUncertainty ? { uncertainty: chartUncertainty } : {}),
  };
  if (birthTimeKnown) {
    if (rawAngles.ascendant !== undefined)
      result.ascendant = mapAscendant(rawAngles.ascendant);
    result.houses = rawHouses.map((item, index) => mapHouse(item, index));
  }
  return result;
}

function chartBody(chart: BirthChart, name: string): PlanetPlacement {
  const planet = chart.planets.find(
    (item) => item.planet.toLowerCase() === name.toLowerCase(),
  );
  if (!planet) throw invalidResponse(`bodies.${name} is missing.`);
  return planet;
}

export function mapPlanetPositions(chart: BirthChart): PlanetPositionsResult {
  return {
    positions: chart.planets,
    metadata: chart.metadata,
    ...(chart.uncertainty ? { uncertainty: chart.uncertainty } : {}),
  };
}

export function mapSunSign(chart: BirthChart): SignResult {
  const sun = chartBody(chart, "sun");
  return {
    sign: sun.sign,
    degree: sun.degree,
    longitude: sun.longitude,
    metadata: chart.metadata,
  };
}

function explicitMoonUncertainty(
  chart: BirthChart,
): import("./types").MoonSignResult["uncertainty"] {
  const raw = chart.metadata.raw;
  const candidate =
    raw?.moonUncertainty ??
    (isRecord(raw?.uncertainty) ? raw.uncertainty.moon : undefined);
  if (!isRecord(candidate) || typeof candidate.ambiguous !== "boolean")
    return undefined;
  const possibleSigns = Array.isArray(candidate.possibleSigns)
    ? candidate.possibleSigns.map((sign) =>
        zodiacSign(sign, "moon uncertainty possibleSigns"),
      )
    : undefined;
  const interval = isRecord(candidate.interval)
    ? {
        ...(typeof candidate.interval.start === "string"
          ? { start: candidate.interval.start }
          : {}),
        ...(typeof candidate.interval.end === "string"
          ? { end: candidate.interval.end }
          : {}),
      }
    : undefined;
  return {
    ambiguous: candidate.ambiguous,
    ...(possibleSigns ? { possibleSigns } : {}),
    ...(interval ? { interval } : {}),
    ...(typeof candidate.reason === "string"
      ? { reason: candidate.reason }
      : {}),
  };
}

export function mapMoonSign(chart: BirthChart): MoonSignResult {
  const moon = chartBody(chart, "moon");
  const serverUncertainty = explicitMoonUncertainty(chart);
  if (!chart.birthTimeKnown) {
    if (!serverUncertainty || serverUncertainty.ambiguous) {
      return {
        ...(serverUncertainty
          ? { uncertainty: serverUncertainty }
          : {
              uncertainty: {
                ambiguous: true,
                reason:
                  "The backend marked birth time as unknown and did not return a time-independent Moon sign.",
              },
            }),
        metadata: chart.metadata,
      };
    }
  }
  return {
    sign: moon.sign,
    degree: moon.degree,
    longitude: moon.longitude,
    ...(serverUncertainty ? { uncertainty: serverUncertainty } : {}),
    metadata: chart.metadata,
  };
}

export function mapRisingSign(chart: BirthChart): RisingSignResult {
  if (!chart.birthTimeKnown) throw new BirthTimeRequiredError();
  if (!chart.ascendant)
    throw new ApiError("The backend did not return a rising sign.", {
      code: "MISSING_RISING_SIGN",
    });
  return { ...chart.ascendant, metadata: chart.metadata };
}

export function mapBigThree(chart: BirthChart): BigThreeResult {
  const result: BigThreeResult = {
    sun: mapSunSign(chart),
    moon: mapMoonSign(chart),
    birthTimeKnown: chart.birthTimeKnown,
    ...(chart.uncertainty ? { uncertainty: chart.uncertainty } : {}),
  };
  if (chart.ascendant) result.rising = mapRisingSign(chart);
  return result;
}

export function mapAspects(chart: BirthChart): AspectsResult {
  return {
    aspects: chart.aspects,
    metadata: chart.metadata,
    ...(chart.uncertainty ? { uncertainty: chart.uncertainty } : {}),
  };
}

function summary(chart: BirthChart) {
  return {
    planets: chart.planets,
    ...(chart.ascendant ? { ascendant: chart.ascendant } : {}),
    ...(chart.houses ? { houses: chart.houses } : {}),
    birthTimeKnown: chart.birthTimeKnown,
    metadata: chart.metadata,
  };
}

export function mapSynastry(
  value: unknown,
  requestId?: string,
): SynastryResult {
  const root = asObject(value, "synastry");
  const chartA = mapBirthChart(root.chartA, requestId);
  const chartB = mapBirthChart(root.chartB, requestId);
  if (!Array.isArray(root.crossAspects))
    throw invalidResponse("crossAspects is missing or malformed.");
  const aspects = root.crossAspects.map(
    (item, index) => mapAspect(item, index, true) as SynastryAspect,
  );
  const rootMetadata = metadata(
    root.meta,
    root.schemaVersion,
    requestId,
    chartA.metadata,
  );
  const reasons = [
    ...(chartA.uncertainty?.reasons ?? []),
    ...(chartB.uncertainty?.reasons ?? []),
  ];
  const result: SynastryResult = {
    aspects,
    personA: summary(chartA),
    personB: summary(chartB),
    metadata: rootMetadata,
  };
  const raw = asJsonObject(root);
  if (raw) result.raw = raw;
  if (reasons.length > 0 || !chartA.birthTimeKnown || !chartB.birthTimeKnown) {
    result.uncertainty = {
      birthTimeKnown: chartA.birthTimeKnown && chartB.birthTimeKnown,
      reasons,
      unavailableFields: [
        ...(!chartA.birthTimeKnown
          ? ["personA.ascendant", "personA.houses"]
          : []),
        ...(!chartB.birthTimeKnown
          ? ["personB.ascendant", "personB.houses"]
          : []),
      ],
    };
  }
  return result;
}

export function synastryPayload(input: SynastryInput): {
  chart_a: NatalPayload;
  chart_b: NatalPayload;
} {
  return {
    chart_a: toNatalPayload(input.personA),
    chart_b: toNatalPayload(input.personB),
  };
}
