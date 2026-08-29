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
  houseSystem?: string;
  aspectProfile?: string;
  zodiac?: string;
  ayanamsa?: string;
  apiVersion?: string;
  schemaVersion?: string;
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
