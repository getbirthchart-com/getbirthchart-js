import type { ZodiacSign } from "./common";

export type PlanetName =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export type CelestialBodyName =
  PlanetName | "True Node" | "Mean Node" | "Chiron" | (string & {});

export interface PlanetPlacement {
  planet: CelestialBodyName;
  sign: ZodiacSign;
  degree: number;
  longitude: number;
  latitude?: number;
  house?: number;
  retrograde?: boolean;
}

export interface PlanetPositionsResult {
  positions: PlanetPlacement[];
  metadata: import("./common").ChartMetadata;
  uncertainty?: import("./uncertainty").ChartUncertainty;
}
