const express = require("express");
const { randomUUID } = require("crypto");
const redisClient = require("../lib/redis");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/api/trading/orders", authMiddleware, async (req, res) => {
  const { symbol, side, type, quantity } = req.body;

  if (!symbol || !side || !type || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

 const orderId = randomUUID();


  const command = {
    orderId,
    userId: req.user.email,
    symbol,
    side,
    type,
    quantity,
    status: "PENDING",
    timestamp: Date.now(),
  };

  await redisClient.publish(
    "commands:order:submit",
    JSON.stringify(command)
  );

  res.json({
    orderId,
    status: "PENDING",
  });
});

module.exports = router;
