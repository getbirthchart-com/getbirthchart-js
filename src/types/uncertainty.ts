import type { JsonObject } from "./common";

export interface ChartWarning {
  code: string;
  severity?: string;
  message: string;
  fieldsAffected?: string[];
  raw?: JsonObject;
}

export interface ChartUncertainty {
  birthTimeKnown: boolean;
  reasons: string[];
  unavailableFields: string[];
  warnings?: ChartWarning[];
}

export interface MoonUncertainty {
  ambiguous: boolean;
  possibleSigns?: import("./common").ZodiacSign[];
  interval?: {
    start?: string;
    end?: string;
  };
  reason?: string;
}
