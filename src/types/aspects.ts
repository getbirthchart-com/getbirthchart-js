import type { ChartMetadata } from "./common";
import type { ChartUncertainty } from "./uncertainty";

export interface Aspect {
  body1: string;
  body2: string;
  type: string;
  orb: number;
  applying?: boolean;
  phase?: string;
  exactAngle?: number;
  actualAngle?: number;
}

export interface AspectsResult {
  aspects: Aspect[];
  metadata?: ChartMetadata;
  uncertainty?: ChartUncertainty;
}
