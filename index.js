const express = require("express");

const app = express();

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Car servicing data is coming");
});

app.listen(port, () => {
  console.log("The port is running 5000");
});
