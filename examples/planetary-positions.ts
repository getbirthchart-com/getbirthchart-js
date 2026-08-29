import { GetBirthChart, type BirthDataInput } from "../src/index";

const input: BirthDataInput = {
  date: "1990-01-15",
  time: "12:00",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
};

const apiKey = process.env.GETBIRTHCHART_API_KEY;
const client = new GetBirthChart(apiKey ? { apiKey } : {});
const result = await client.getPlanetPositions(input);
for (const position of result.positions) {
  console.log(
    position.planet,
    position.sign,
    position.degree,
    position.longitude,
  );
}
