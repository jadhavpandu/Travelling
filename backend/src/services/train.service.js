const axios = require("axios");
require("dotenv").config();

let cachedTrain = null;
let lastFetchTime = 0;
const CACHE_TTL = 10 * 60 * 1000;

function trainDurationToMinutes(duration) {
  const [h, m] = duration.split(":").map(Number);
  return h * 60 + m;
}

async function getFastestTrain(date) {

 
  if (cachedTrain && Date.now() - lastFetchTime < CACHE_TTL) {
    return cachedTrain;
  }

  try {
    const response = await axios.get(
      "https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations",
      {
        params: {
          fromStationCode: "PUNE",
          toStationCode: "CSMT",
          dateOfJourney: date 
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "irctc1.p.rapidapi.com"
        }
      }
    );

    const trains = response.data?.data;
    if (!trains || trains.length === 0) {
      throw new Error("No train data available");
    }

    let fastest = null;
    for (const train of trains) {
      const minutes = trainDurationToMinutes(train.duration);
      if (!fastest || minutes < fastest.durationMinutes) {
        fastest = {
          mode: "Train",
          name: train.train_name,
          departure: train.from_std,
          arrival: train.to_std,
          durationMinutes: minutes
        };
      }
    }

 
    cachedTrain = fastest;
    lastFetchTime = Date.now();

    return fastest;

  } catch (err) {
    console.error("Train API error:", err.response?.status || err.message);

    
    if (err.response?.status === 429 && cachedTrain) {
      return cachedTrain;
    }


    throw new Error("Train service unavailable");
  }
}

module.exports = { getFastestTrain };
