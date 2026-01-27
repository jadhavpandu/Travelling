const express = require("express");
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

    const train = await getFastestTrain(date);
    res.json(train);

  } catch (err) {
    res.status(503).json({
      message: err.message
    });
  }
});


module.exports = router;
