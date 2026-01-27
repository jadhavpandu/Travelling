const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());


app.use(express.json());

app.use("/api/flights", require("./routes/flight.routes"));
app.use("/api/trains", require("./routes/train.routes"));
app.use("/api/compare", require("./routes/compare.routes"));


module.exports = app;
