import { GetBirthChart } from "../src/index";

const apiKey = process.env.GETBIRTHCHART_API_KEY;
const client = new GetBirthChart(apiKey ? { apiKey } : {});
const chart = await client.calculateBirthChart({
  date: "1990-01-15",
  place: "New York, NY",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
  unknownTime: true,
});

console.log(chart.ascendant); // undefined: no birth time was supplied
console.log(chart.houses); // undefined: no birth time was supplied
console.log(chart.uncertainty);
