import type { Aspect } from "./aspects";
import type { BirthChart } from "./chart";
import type {
  BirthDataInput,
  ChartMetadata,
  JsonObject,
  NodeType,
} from "./common";
import type { ChartUncertainty } from "./uncertainty";

export interface SynastryInput {
  personA: BirthDataInput;
  personB: BirthDataInput;
  relationshipType?: RelationshipType;
  topic?: EvidenceTopic;
  /** Relationship-level convention; omitted means the API's True Node default. */
  nodeType?: NodeType;
  targetInstant?: string;
}

export interface SynastryAspect extends Aspect {
  id?: string;
}

export interface BirthChartSummary {
  planets: BirthChart["planets"];
  ascendant?: BirthChart["ascendant"];
  houses?: BirthChart["houses"];
  points?: BirthChart["points"];
  birthTimeKnown: boolean;
  metadata: ChartMetadata;
  uncertainty?: ChartUncertainty;
  unknownTimeAssessment?: BirthChart["unknownTimeAssessment"];
}

export interface SynastryResult {
  schemaVersion: string;
  aspects: SynastryAspect[];
  personA?: BirthChartSummary;
  personB?: BirthChartSummary;
  uncertainty?: ChartUncertainty;
  metadata?: ChartMetadata;
  /** Additional server-owned relationship facts, preserved without coercion. */
  raw?: import("./common").JsonObject;
}

export interface CompositeResult {
  schemaVersion: string;
  metadata: ChartMetadata;
  planets: BirthChart["planets"];
  aspects: BirthChart["aspects"];
  houses: NonNullable<BirthChart["houses"]>;
  ascendant?: BirthChart["ascendant"];
  midpoints: JsonObject[];
  warnings?: import("./uncertainty").ChartWarning[];
  raw: JsonObject;
}

export interface DavisonResult {
  schemaVersion: string;
  metadata: ChartMetadata;
  chart: BirthChart;
  derivedFrom: JsonObject;
  warnings?: import("./uncertainty").ChartWarning[];
  raw: JsonObject;
}

export type RelationshipType =
  "general" | "romantic" | "friendship" | "family" | "work";

export type EvidenceTopic =
  | "overall"
  | "emotional"
  | "communication"
  | "attraction"
  | "stability"
  | "growth"
  | "conflict"
  | "patterns"
  | "direction";
