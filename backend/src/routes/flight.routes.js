const express = require("express");
const { getFastestFlight } = require("../services/flight.service");

const router = express.Router();

router.get("/fastest", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Travel date is required"
      });
    }

    const flight = await getFastestFlight(date);
    res.json(flight);

  } catch (err) {
    res.status(503).json({
      message: err.message
    });
  }
});


module.exports = router;
