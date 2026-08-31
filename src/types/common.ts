export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

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

export type Zodiac = "tropical" | "sidereal";

export type HouseSystem =
  | "placidus"
  | "koch"
  | "porphyry"
  | "campanus"
  | "regiomontanus"
  | "alcabitius"
  | "topocentric"
  | "morinus"
  | "meridian"
  | "whole_sign"
  | "equal";

export type ProductHouseSystem = "placidus" | "whole_sign" | "equal";

export type NodeType = "true" | "mean";

export type AspectPreset =
  "standard" | "extended" | "custom" | "modern-major-v1";

export type Ayanamsa =
  "lahiri" | "true_citra" | "fagan_bradley" | "krishnamurti" | "raman";

/** Public engine values plus future additive values accepted by the API. */
export type AdditionalPoint =
  | "mean_lilith"
  | "true_lilith"
  | "osculating_lilith"
  | "part_of_fortune"
  | "vertex"
  | (string & {});

export interface CustomAspectRule {
  type: string;
  exactAngle: number;
  orb: number;
}

export interface BirthDataInput {
  /** Local civil date in YYYY-MM-DD format. */
  date: string;
  /** Local clock time in HH:mm or HH:mm:ss format. */
  time?: string;
  /** Optional caller-side label. The current backend does not geocode it. */
  place?: string;
  latitude?: number;
  longitude?: number;
  /** IANA timezone, for example America/New_York. */
  timezone?: string;
  /** Must be true when no reliable birth time is available. */
  unknownTime?: boolean;
  /** Optional altitude in metres. */
  altitudeM?: number;
  /** Registered engine house system; product-facing values are Placidus, Whole Sign and Equal. */
  houseSystem?: HouseSystem;
  /** Lunar node convention. Defaults to True Node. */
  nodeType?: NodeType;
  /** Natal aspect preset. Custom requires customAspectRules. */
  aspectPreset?: AspectPreset;
  /** Custom natal aspect rules, serialized as exact_angle by the HTTP API. */
  customAspectRules?: CustomAspectRule[];
  /** Opt-in additional points such as mean_lilith, true_lilith, vertex or part_of_fortune. */
  additionalPoints?: AdditionalPoint[];
  /** PEP 495 fold for an explicitly disambiguated local time. */
  fold?: 0 | 1;
  /** Position frame. Defaults to tropical. */
  zodiac?: Zodiac;
  /** Required with sidereal zodiac; Lahiri is the recommended product choice. */
  ayanamsa?: Ayanamsa;
}

export interface GetBirthChartOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  fetch?: typeof globalThis.fetch;
}

export interface ChartMetadata {
  engineVersion: string;
  engine?: string;
  ephemerisProvider?: string;
  ephemerisDataVersion?: string;
  timezoneDataVersion?: string;
  calculationProfile?: string;
  houseSystem?: HouseSystem | string;
  requestedHouseSystem?: HouseSystem | string;
  houseAlgorithmVersion?: string;
  aspectProfile?: string;
  aspectProfileVersion?: string;
  aspectPreset?: AspectPreset | string;
  customAspectRules?: CustomAspectRule[];
  zodiac?: Zodiac | string;
  nodeType?: NodeType | string;
  additionalPoints?: AdditionalPoint[];
  ayanamsa?: Ayanamsa | string;
  ayanamsha?: Ayanamsa | string;
  ayanamsaVersion?: string;
  ayanamsaDegrees?: number;
  pointProfile?: string;
  pointProfileVersion?: string;
  rulershipProfile?: string;
  rulershipProfileVersion?: string;
  dominantProfile?: string;
  dominantProfileVersion?: string;
  apiVersion?: string;
  schemaVersion?: string;
  /** Optional HTTP additive field; the API is allowed to omit it. */
  calculationHash?: string;
  requestId?: string;
  /** Unmodified backend metadata for forward-compatible fields. */
  raw?: JsonObject;
}

export interface Location {
  latitude: number;
  longitude: number;
  timezone: string;
  place?: string;
}
