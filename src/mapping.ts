import { ApiError, BirthTimeRequiredError, ValidationError } from "./errors";
import type {
  AdditionalPoint,
  Aspect,
  AspectsResult,
  CustomAspectRule,
  BirthChart,
  BigThreeResult,
  ChartMetadata,
  ChartUncertainty,
  ChartWarning,
  CompositeResult,
  DavisonResult,
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
  altitude_m?: number;
  house_system?: string;
  node_type?: string;
  aspect_preset?: string;
  custom_aspect_rules?: Array<{
    type: string;
    exact_angle: number;
    orb: number;
  }>;
  additional_points?: string[];
  fold?: 0 | 1;
  zodiac?: string;
  ayanamsa?: string;
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

function compatibleSchemaVersion(value: unknown, label: string): string {
  const version = asString(value, label);
  const major = Number(version.split(".")[0]);
  if (!Number.isInteger(major) || major !== 1) {
    throw new ApiError(
      `${label} major version ${version} is not supported by this SDK.`,
      { code: "UNSUPPORTED_SCHEMA_VERSION" },
    );
  }
  return version;
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
    ...(typeof raw.aspectProfileVersion === "string"
      ? { aspectProfileVersion: raw.aspectProfileVersion }
      : {}),
    ...(typeof raw.aspectPreset === "string"
      ? { aspectPreset: raw.aspectPreset }
      : {}),
    ...(Array.isArray(raw.customAspectRules)
      ? {
          customAspectRules: raw.customAspectRules.flatMap((item) => {
            if (!isRecord(item)) return [];
            if (
              typeof item.type !== "string" ||
              typeof item.exactAngle !== "number" ||
              typeof item.orb !== "number"
            )
              return [];
            return [
              {
                type: item.type,
                exactAngle: item.exactAngle,
                orb: item.orb,
              } satisfies CustomAspectRule,
            ];
          }),
        }
      : {}),
    ...(typeof raw.zodiac === "string" ? { zodiac: raw.zodiac } : {}),
    ...(typeof raw.nodeType === "string" ? { nodeType: raw.nodeType } : {}),
    ...(Array.isArray(raw.additionalPoints)
      ? {
          additionalPoints: raw.additionalPoints.filter(
            (item): item is AdditionalPoint => typeof item === "string",
          ),
        }
      : {}),
    ...(typeof raw.ayanamsa === "string" ? { ayanamsa: raw.ayanamsa } : {}),
    ...(typeof raw.ayanamsha === "string" ? { ayanamsha: raw.ayanamsha } : {}),
    ...(typeof raw.ayanamsaVersion === "string"
      ? { ayanamsaVersion: raw.ayanamsaVersion }
      : {}),
    ...(typeof raw.ayanamsaDegrees === "number"
      ? { ayanamsaDegrees: raw.ayanamsaDegrees }
      : {}),
    ...(typeof raw.requestedHouseSystem === "string"
      ? { requestedHouseSystem: raw.requestedHouseSystem }
      : {}),
    ...(typeof raw.houseAlgorithmVersion === "string"
      ? { houseAlgorithmVersion: raw.houseAlgorithmVersion }
      : {}),
    ...(typeof raw.pointProfile === "string"
      ? { pointProfile: raw.pointProfile }
      : {}),
    ...(typeof raw.pointProfileVersion === "string"
      ? { pointProfileVersion: raw.pointProfileVersion }
      : {}),
    ...(typeof raw.rulershipProfile === "string"
      ? { rulershipProfile: raw.rulershipProfile }
      : {}),
    ...(typeof raw.rulershipProfileVersion === "string"
      ? { rulershipProfileVersion: raw.rulershipProfileVersion }
      : {}),
    ...(typeof raw.dominantProfile === "string"
      ? { dominantProfile: raw.dominantProfile }
      : {}),
    ...(typeof raw.dominantProfileVersion === "string"
      ? { dominantProfileVersion: raw.dominantProfileVersion }
      : {}),
    ...(typeof raw.apiVersion === "string"
      ? { apiVersion: raw.apiVersion }
      : {}),
    ...(typeof schemaVersion === "string" ? { schemaVersion } : {}),
    ...(typeof raw.calculationHash === "string"
      ? { calculationHash: raw.calculationHash }
      : {}),
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

function mapDerivedPoint(value: unknown, label: string) {
  const raw = asObject(value, label);
  const alternativeLongitude = optionalNumber(
    raw.alternativeLongitude,
    `${label}.alternativeLongitude`,
  );
  const house = optionalNumber(raw.house, `${label}.house`);
  const rawJson = asJsonObject(raw);
  return {
    longitude: asNumber(raw.longitude, `${label}.longitude`),
    sign: zodiacSign(raw.sign, `${label}.sign`),
    degree: asNumber(raw.degreeInSign, `${label}.degreeInSign`),
    method: asString(raw.method, `${label}.method`),
    requiresBirthTime:
      typeof raw.requiresBirthTime === "boolean"
        ? raw.requiresBirthTime
        : (() => {
            throw invalidResponse(`${label}.requiresBirthTime is malformed.`);
          })(),
    ...(house !== undefined ? { house } : {}),
    ...(alternativeLongitude !== undefined ? { alternativeLongitude } : {}),
    ...(rawJson ? { raw: rawJson } : {}),
  };
}

function mapUnknownTimeAssessment(value: unknown) {
  const raw = asObject(value, "unknownTimeAssessment");
  const rawJson = asJsonObject(raw);
  const interval = asJsonObject(raw.interval);
  const bodies = isRecord(raw.bodies)
    ? Object.fromEntries(
        Object.entries(raw.bodies).flatMap(([key, item]) => {
          const json = asJsonObject(item);
          return json ? [[key, json]] : [];
        }),
      )
    : undefined;
  const aspects = isRecord(raw.aspects)
    ? Object.fromEntries(
        Object.entries(raw.aspects).flatMap(([key, item]) => {
          const json = asJsonObject(item);
          return json ? [[key, json]] : [];
        }),
      )
    : undefined;
  const unavailable = Array.isArray(raw.unavailable)
    ? raw.unavailable.filter((item): item is string => typeof item === "string")
    : [];
  if (
    unavailable.length !==
    (Array.isArray(raw.unavailable) ? raw.unavailable.length : 0)
  )
    throw invalidResponse("unknownTimeAssessment.unavailable is malformed.");
  const provenance = asJsonObject(raw.provenance);
  return {
    version: asString(raw.version, "unknownTimeAssessment.version"),
    algorithmVersion: asString(
      raw.algorithmVersion,
      "unknownTimeAssessment.algorithmVersion",
    ),
    anchor: asString(raw.anchor, "unknownTimeAssessment.anchor"),
    assessmentComplete:
      typeof raw.assessmentComplete === "boolean"
        ? raw.assessmentComplete
        : (() => {
            throw invalidResponse(
              "unknownTimeAssessment.assessmentComplete is malformed.",
            );
          })(),
    ...(interval ? { interval } : {}),
    ...(bodies ? { bodies } : {}),
    ...(aspects ? { aspects } : {}),
    unavailable,
    ...(provenance ? { provenance } : {}),
    ...(rawJson ? { raw: rawJson } : {}),
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
  if (
    input.altitudeM !== undefined &&
    (!Number.isFinite(input.altitudeM) ||
      input.altitudeM < -500 ||
      input.altitudeM > 10000)
  ) {
    throw new ValidationError(
      "altitudeM must be between -500 and 10000 metres.",
    );
  }
  const houseSystems = new Set([
    "placidus",
    "koch",
    "porphyry",
    "campanus",
    "regiomontanus",
    "alcabitius",
    "topocentric",
    "morinus",
    "meridian",
    "whole_sign",
    "equal",
  ]);
  if (input.houseSystem !== undefined && !houseSystems.has(input.houseSystem))
    throw new ValidationError("houseSystem is not supported by the API.");
  if (
    input.nodeType !== undefined &&
    !["true", "mean"].includes(input.nodeType)
  )
    throw new ValidationError("nodeType must be 'true' or 'mean'.");
  if (
    input.aspectPreset !== undefined &&
    !["standard", "extended", "custom", "modern-major-v1"].includes(
      input.aspectPreset,
    )
  )
    throw new ValidationError("aspectPreset is not supported by the API.");
  if (input.aspectPreset === "custom" && !input.customAspectRules?.length)
    throw new ValidationError(
      "customAspectRules are required when aspectPreset is 'custom'.",
    );
  if (input.customAspectRules && input.aspectPreset !== "custom")
    throw new ValidationError(
      "customAspectRules are only valid when aspectPreset is 'custom'.",
    );
  if (input.customAspectRules) {
    for (const rule of input.customAspectRules) {
      if (
        !rule.type.trim() ||
        !Number.isFinite(rule.exactAngle) ||
        rule.exactAngle < 0 ||
        rule.exactAngle > 180 ||
        !Number.isFinite(rule.orb) ||
        rule.orb < 0 ||
        rule.orb > 15
      )
        throw new ValidationError("customAspectRules contain an invalid rule.");
    }
  }
  if (input.fold !== undefined && input.fold !== 0 && input.fold !== 1)
    throw new ValidationError("fold must be 0 or 1.");
  if (
    input.zodiac !== undefined &&
    !["tropical", "sidereal"].includes(input.zodiac)
  )
    throw new ValidationError("zodiac must be 'tropical' or 'sidereal'.");
  if (input.zodiac === "sidereal" && input.ayanamsa === undefined)
    throw new ValidationError(
      "ayanamsa is required when zodiac is 'sidereal'.",
    );
  if (input.zodiac !== "sidereal" && input.ayanamsa !== undefined)
    throw new ValidationError(
      "ayanamsa is only meaningful with sidereal zodiac.",
    );

  const payload: NatalPayload = {
    local_date: input.date,
    local_time: unknownTime ? null : (input.time ?? null),
    unknown_time: unknownTime,
    timezone: input.timezone.trim(),
    latitude,
    longitude,
  };
  if (input.altitudeM !== undefined) payload.altitude_m = input.altitudeM;
  if (input.houseSystem !== undefined) payload.house_system = input.houseSystem;
  if (input.nodeType !== undefined) payload.node_type = input.nodeType;
  if (input.aspectPreset !== undefined)
    payload.aspect_preset = input.aspectPreset;
  if (input.customAspectRules !== undefined) {
    payload.custom_aspect_rules = input.customAspectRules.map((rule) => ({
      type: rule.type,
      exact_angle: rule.exactAngle,
      orb: rule.orb,
    }));
  }
  if (input.additionalPoints !== undefined)
    payload.additional_points = [...input.additionalPoints];
  if (input.fold !== undefined) payload.fold = input.fold;
  if (input.zodiac !== undefined) payload.zodiac = input.zodiac;
  if (input.ayanamsa !== undefined) payload.ayanamsa = input.ayanamsa;
  return payload;
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
  const schemaVersion = compatibleSchemaVersion(
    root.schemaVersion,
    "schemaVersion",
  );
  const chartMetadata = metadata(root.meta, schemaVersion, requestId);
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
  if (isRecord(root.points)) {
    result.points = Object.fromEntries(
      Object.entries(root.points).map(([name, point]) => [
        name,
        mapDerivedPoint(point, `points.${name}`),
      ]),
    );
  }
  result.derived = root.derived as import("./types").JsonObject;
  if (isRecord(root.unknownTimeAssessment))
    result.unknownTimeAssessment = mapUnknownTimeAssessment(
      root.unknownTimeAssessment,
    );
  const rawJson = asJsonObject(root);
  if (rawJson) result.raw = rawJson;
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
    ...(chart.points ? { points: chart.points } : {}),
    birthTimeKnown: chart.birthTimeKnown,
    metadata: chart.metadata,
    ...(chart.uncertainty ? { uncertainty: chart.uncertainty } : {}),
    ...(chart.unknownTimeAssessment
      ? { unknownTimeAssessment: chart.unknownTimeAssessment }
      : {}),
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
    compatibleSchemaVersion(root.schemaVersion, "synastry.schemaVersion"),
    requestId,
    chartA.metadata,
  );
  const reasons = [
    ...(chartA.uncertainty?.reasons ?? []),
    ...(chartB.uncertainty?.reasons ?? []),
  ];
  const result: SynastryResult = {
    schemaVersion: rootMetadata.schemaVersion ?? "1.0.0",
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
  relationship_type?: string;
  topic?: string;
  node_type?: string;
  target_instant?: string;
} {
  const payload: {
    chart_a: NatalPayload;
    chart_b: NatalPayload;
    relationship_type?: string;
    topic?: string;
    node_type?: string;
    target_instant?: string;
  } = {
    chart_a: toNatalPayload(input.personA),
    chart_b: toNatalPayload(input.personB),
  };
  if (input.relationshipType !== undefined)
    payload.relationship_type = input.relationshipType;
  if (input.topic !== undefined) payload.topic = input.topic;
  if (input.nodeType !== undefined) payload.node_type = input.nodeType;
  if (input.targetInstant !== undefined)
    payload.target_instant = input.targetInstant;
  return payload;
}

export function mapComposite(
  value: unknown,
  requestId?: string,
): CompositeResult {
  const root = asObject(value, "composite");
  const schemaVersion = compatibleSchemaVersion(
    root.schemaVersion,
    "composite.schemaVersion",
  );
  const bodyObject = asObject(root.bodies, "composite.bodies");
  const rawAngles = asObject(root.angles, "composite.angles");
  const rawHouses = root.houses;
  if (!Array.isArray(rawHouses))
    throw invalidResponse("composite.houses is malformed.");
  if (!Array.isArray(root.aspects))
    throw invalidResponse("composite.aspects is malformed.");
  if (!Array.isArray(root.midpoints))
    throw invalidResponse("composite.midpoints is malformed.");
  const chartMetadata = metadata(root.meta, schemaVersion, requestId);
  const raw = asJsonObject(root);
  if (!raw) throw invalidResponse("composite response is malformed.");
  const result: CompositeResult = {
    schemaVersion,
    metadata: chartMetadata,
    planets: Object.entries(bodyObject).map(([name, body]) =>
      mapPlanet(body, name),
    ),
    aspects: root.aspects.map((item, index) => mapAspect(item, index)),
    houses: rawHouses.map((item, index) => mapHouse(item, index)),
    midpoints: root.midpoints.flatMap((item) => {
      const json = asJsonObject(item);
      return json ? [json] : [];
    }),
    ...(rawAngles.ascendant !== undefined
      ? { ascendant: mapAscendant(rawAngles.ascendant) }
      : {}),
    raw,
  };
  const rawWarnings = root.warnings;
  if (Array.isArray(rawWarnings) && rawWarnings.length > 0)
    result.warnings = rawWarnings.map((item, index) => warning(item, index));
  return result;
}

export function mapDavison(value: unknown, requestId?: string): DavisonResult {
  const root = asObject(value, "davison");
  const schemaVersion = compatibleSchemaVersion(
    root.schemaVersion,
    "davison.schemaVersion",
  );
  const chart = mapBirthChart(root.chart, requestId);
  const derivedFrom = asJsonObject(root.derivedFrom);
  if (!derivedFrom) throw invalidResponse("davison.derivedFrom is malformed.");
  const rootMetadata = metadata(
    root.meta,
    schemaVersion,
    requestId,
    chart.metadata,
  );
  const raw = asJsonObject(root);
  if (!raw) throw invalidResponse("davison response is malformed.");
  const result: DavisonResult = {
    schemaVersion,
    metadata: rootMetadata,
    chart,
    derivedFrom,
    raw,
  };
  const rawWarnings = root.warnings;
  if (Array.isArray(rawWarnings) && rawWarnings.length > 0)
    result.warnings = rawWarnings.map((item, index) => warning(item, index));
  return result;
}
