import { resolveConfig } from "./config";
import { BirthTimeRequiredError } from "./errors";
import { HttpClient } from "./http";
import {
  mapAspects,
  mapBigThree,
  mapBirthChart,
  mapComposite,
  mapDavison,
  mapMoonSign,
  mapPlanetPositions,
  mapRisingSign,
  mapSunSign,
  mapSynastry,
  synastryPayload,
  toNatalPayload,
} from "./mapping";
import type {
  AspectsResult,
  BirthChart,
  BigThreeResult,
  BirthDataInput,
  CompositeResult,
  DavisonResult,
  GetBirthChartOptions,
  MoonSignResult,
  PlanetPositionsResult,
  RisingSignResult,
  SignResult,
  SynastryInput,
  SynastryResult,
} from "./types";

export class GetBirthChart {
  private readonly http: HttpClient;

  constructor(options: GetBirthChartOptions = {}) {
    this.http = new HttpClient(resolveConfig(options));
  }

  async calculateBirthChart(input: BirthDataInput): Promise<BirthChart> {
    const result = await this.http.request<unknown>(
      "POST",
      "/v1/charts/natal",
      toNatalPayload(input),
    );
    return mapBirthChart(result.data, result.requestId);
  }

  async getPlanetPositions(
    input: BirthDataInput,
  ): Promise<PlanetPositionsResult> {
    return mapPlanetPositions(await this.calculateBirthChart(input));
  }

  async getSunSign(input: BirthDataInput): Promise<SignResult> {
    return mapSunSign(await this.calculateBirthChart(input));
  }

  async getMoonSign(input: BirthDataInput): Promise<MoonSignResult> {
    return mapMoonSign(await this.calculateBirthChart(input));
  }

  async getRisingSign(input: BirthDataInput): Promise<RisingSignResult> {
    if (input.unknownTime === true) throw new BirthTimeRequiredError();
    return mapRisingSign(await this.calculateBirthChart(input));
  }

  async getBigThree(input: BirthDataInput): Promise<BigThreeResult> {
    return mapBigThree(await this.calculateBirthChart(input));
  }

  async calculateAspects(input: BirthDataInput): Promise<AspectsResult> {
    return mapAspects(await this.calculateBirthChart(input));
  }

  async calculateSynastry(input: SynastryInput): Promise<SynastryResult> {
    const result = await this.http.request<unknown>(
      "POST",
      "/v1/charts/synastry",
      synastryPayload(input),
    );
    return mapSynastry(result.data, result.requestId);
  }

  async calculateComposite(input: SynastryInput): Promise<CompositeResult> {
    const result = await this.http.request<unknown>(
      "POST",
      "/v1/charts/composite",
      synastryPayload(input),
    );
    return mapComposite(result.data, result.requestId);
  }

  async calculateDavison(input: SynastryInput): Promise<DavisonResult> {
    const result = await this.http.request<unknown>(
      "POST",
      "/v1/charts/davison",
      synastryPayload(input),
    );
    return mapDavison(result.data, result.requestId);
  }
}
