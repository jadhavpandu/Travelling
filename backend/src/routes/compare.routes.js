const express = require("express");
const { getFastestFlight } = require("../services/flight.service");
const { getFastestTrain } = require("../services/train.service");

const router = express.Router();

router.get("/fastest", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Travel date is required"
      });
    }

    const [flight, train] = await Promise.all([
      getFastestFlight(date),   
      getFastestTrain(date)     
    ]);

    const fastest =
      flight.durationMinutes <= train.durationMinutes
        ? flight
        : train;

    res.json({
      winner: fastest.mode,
      details: fastest
    });

  } catch (err) {
    res.status(503).json({
      message: "Comparison service unavailable"
    });
  }
});

module.exports = router;
