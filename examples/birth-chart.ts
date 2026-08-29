import { GetBirthChart } from "../src/index";

const apiKey = process.env.GETBIRTHCHART_API_KEY;
const client = new GetBirthChart(apiKey ? { apiKey } : {});

const chart = await client.calculateBirthChart({
  date: "1990-01-15",
  time: "12:00",
  place: "New York, NY",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
});

console.log(chart.planets, chart.ascendant, chart.aspects);
