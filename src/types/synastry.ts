import type { Aspect } from "./aspects";
import type { BirthChart } from "./chart";
import type { BirthDataInput, ChartMetadata } from "./common";
import type { ChartUncertainty } from "./uncertainty";

export interface SynastryInput {
  personA: BirthDataInput;
  personB: BirthDataInput;
}

export interface SynastryAspect extends Aspect {
  id?: string;
}

export interface BirthChartSummary {
  planets: BirthChart["planets"];
  ascendant?: BirthChart["ascendant"];
  houses?: BirthChart["houses"];
  birthTimeKnown: boolean;
  metadata: ChartMetadata;
}

export interface SynastryResult {
  aspects: SynastryAspect[];
  personA?: BirthChartSummary;
  personB?: BirthChartSummary;
  uncertainty?: ChartUncertainty;
  metadata?: ChartMetadata;
  /** Additional server-owned relationship facts, preserved without coercion. */
  raw?: import("./common").JsonObject;
}
