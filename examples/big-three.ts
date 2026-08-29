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
const bigThree = await client.getBigThree(input);
console.log(bigThree.sun.sign, bigThree.moon.sign, bigThree.rising?.sign);
