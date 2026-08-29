import { GetBirthChart, type BirthDataInput } from "../src/index";

const personA: BirthDataInput = {
  date: "1990-01-15",
  time: "12:00",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
};
const personB: BirthDataInput = {
  date: "1992-07-20",
  time: "03:30",
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: "Europe/London",
};

const apiKey = process.env.GETBIRTHCHART_API_KEY;
const client = new GetBirthChart(apiKey ? { apiKey } : {});
const result = await client.calculateSynastry({ personA, personB });
console.log(result.aspects, result.personA, result.personB);
