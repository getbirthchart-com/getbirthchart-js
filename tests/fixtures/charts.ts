export const knownChart = {
  schemaVersion: "1.3.0",
  meta: {
    engine: "gbc-astro",
    engineVersion: "1.12.2",
    ephemerisProvider: "swiss",
    ephemerisDataVersion: "2.10.03",
    timezoneDataVersion: "system-zoneinfo",
    calculationProfile: "western-modern-v1",
    houseSystem: "placidus",
    aspectProfile: "modern-major-v1",
    zodiac: "tropical",
  },
  subject: {
    localDateTime: "1990-01-15T12:00:00",
    timezone: "America/New_York",
    utcDateTime: "1990-01-15T17:00:00Z",
    julianDay: 2447908.208333,
    latitude: 40.7128,
    longitude: -74.006,
    altitudeM: null,
    birthTimeKnown: true,
    calendar: "gregorian",
  },
  angles: {
    ascendant: { longitude: 42.1, sign: "taurus", degreeInSign: 12.1 },
    mc: { longitude: 294, sign: "capricorn", degreeInSign: 24 },
  },
  bodies: {
    sun: {
      longitude: 295.28,
      latitude: 0,
      sign: "capricorn",
      degreeInSign: 25.28,
      house: 9,
      retrograde: false,
    },
    moon: {
      longitude: 170.08,
      latitude: 1.2,
      sign: "virgo",
      degreeInSign: 20.08,
      house: 5,
      retrograde: false,
    },
    mercury: {
      longitude: 281.18,
      latitude: -1,
      sign: "capricorn",
      degreeInSign: 11.18,
      house: 9,
      retrograde: true,
    },
    true_node: {
      longitude: 316.6,
      latitude: 0,
      sign: "aquarius",
      degreeInSign: 16.6,
      house: 10,
    },
  },
  houses: [
    { number: 1, cuspLongitude: 42.1, sign: "taurus", degreeInSign: 12.1 },
    { number: 2, cuspLongitude: 72.1, sign: "gemini", degreeInSign: 12.1 },
  ],
  aspects: [
    {
      a: "sun",
      b: "moon",
      type: "trine",
      exactAngle: 120,
      actualAngle: 125.2,
      orb: 5.2,
      phase: "applying",
    },
  ],
  derived: { bigThree: { sun: "capricorn", moon: "virgo", rising: "taurus" } },
  warnings: [],
} as const;

export const unknownChart = {
  ...knownChart,
  meta: { ...knownChart.meta, houseSystem: null },
  subject: {
    ...knownChart.subject,
    localDateTime: "1990-01-15",
    birthTimeKnown: false,
  },
  angles: {},
  houses: [],
  derived: { bigThree: { sun: "capricorn", moon: "virgo", rising: null } },
  warnings: [
    {
      code: "UNKNOWN_BIRTH_TIME",
      severity: "warning",
      message: "Birth time is unknown.",
      fieldsAffected: ["angles", "houses"],
    },
  ],
} as const;

export const unknownStableMoonChart = {
  ...unknownChart,
  meta: {
    ...unknownChart.meta,
    moonUncertainty: {
      ambiguous: false,
      reason: "The Moon remains in one sign for the valid date interval.",
    },
  },
} as const;

export const synastryChart = {
  schemaVersion: "1.3.0",
  meta: { engine: "gbc-astro", engineVersion: "1.12.2", zodiac: "tropical" },
  chartA: knownChart,
  chartB: unknownChart,
  crossAspects: [
    {
      id: "cross-1",
      a: "A.sun",
      b: "B.moon",
      type: "trine",
      exactAngle: 120,
      actualAngle: 119.4,
      orb: 0.6,
      phase: "indeterminate",
    },
  ],
  aBodiesInBHouses: [],
  bBodiesInAHouses: [],
  angleInteractions: [],
  patterns: [],
  pointContacts: [],
  rulerInteractions: [],
  directionalThemes: [],
  warnings: [],
} as const;
