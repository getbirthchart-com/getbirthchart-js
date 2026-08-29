import type { ChartMetadata, ZodiacSign } from "./common";
import type { Aspect } from "./aspects";
import type { PlanetPlacement } from "./planets";
import type { ChartUncertainty, MoonUncertainty } from "./uncertainty";

export interface Ascendant {
  sign: ZodiacSign;
  degree: number;
  longitude?: number;
}

export interface House {
  number: number;
  cuspLongitude: number;
  sign: ZodiacSign;
  degree: number;
}

export interface BirthChart {
  planets: PlanetPlacement[];
  aspects: Aspect[];
  ascendant?: Ascendant;
  houses?: House[];
  birthTimeKnown: boolean;
  uncertainty?: ChartUncertainty;
  metadata: ChartMetadata;
  warnings?: import("./uncertainty").ChartWarning[];
}

export interface SignResult {
  sign: ZodiacSign;
  degree?: number;
  longitude?: number;
  metadata?: ChartMetadata;
}

export interface MoonSignResult {
  sign?: ZodiacSign;
  degree?: number;
  longitude?: number;
  uncertainty?: MoonUncertainty;
  metadata?: ChartMetadata;
}

export interface RisingSignResult {
  sign: ZodiacSign;
  degree: number;
  longitude?: number;
  metadata?: ChartMetadata;
}

export interface BigThreeResult {
  sun: SignResult;
  moon: MoonSignResult;
  rising?: RisingSignResult;
  birthTimeKnown: boolean;
  uncertainty?: ChartUncertainty;
}
