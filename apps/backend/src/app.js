const express = require("express");
const cors = require("cors");

const healthRoute = require("./routes/health");
const authRoute = require("./routes/auth");
const tradingRoute = require("./routes/trading");
const ordersRoute = require("./routes/orders");




const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// routes
app.use(healthRoute);
app.use(authRoute);
app.use(tradingRoute);
app.use(ordersRoute);


app.get("/", (req, res) => {
  res.send("Backend API Gateway is running 🚀");
});

module.exports = app;
