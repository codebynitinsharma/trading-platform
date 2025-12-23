const express = require("express");
const authMiddleware = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("redis");

const router = express.Router();
const prisma = new PrismaClient();

// 🔴 Redis publisher (ONLY publishes)
const redisPub = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

(async () => {
  await redisPub.connect();
  console.log("Redis publisher connected (API Gateway)");
})();

// ==============================
// GET orders (protected)
// ==============================
router.get("/api/trading/orders", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { email: req.user.email },
    include: { orders: true },
  });

  res.json({
    orders: user?.orders || [],
  });
});

// ==============================
// POST order → Redis → Execution
// ==============================
router.post("/api/trading/orders", authMiddleware, async (req, res) => {
  try {
    const { symbol, side, type, quantity, price } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 1️⃣ Create order in DB
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        symbol,
        side,
        type,
        quantity,
        price: price || null,
        status: "SUBMITTED",
      },
    });

    // 2️⃣ 🔥 PUBLISH TO REDIS (THIS WAS MISSING)
    await redisPub.publish(
      "commands:order:submit",
      JSON.stringify({
        orderId: order.id,
        userId: user.email, // execution-service expects email
        symbol,
        side,
        type,
        quantity,
      })
    );

    console.log("Order published to Redis:", order.id);

    res.json({
      success: true,
      orderId: order.id,
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});
router.post("/api/trading/orders/:id/cancel", authMiddleware, async (req, res) => {
  const orderId = req.params.id;

  const user = await prisma.user.findUnique({
    where: { email: req.user.email },
  });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.userId !== user.id) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.status !== "SUBMITTED") {
    return res.status(400).json({ error: "Cannot cancel this order" });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELED" },
  });

  res.json({ success: true });
});


module.exports = router;
