require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { createClient } = require("redis");
const axios = require("axios");

const prisma = new PrismaClient();

const redisSub = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

const redisPub = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// 🔹 Fetch price from Binance Testnet
async function getMarketPrice(symbol) {
  const res = await axios.get(
    "https://testnet.binance.vision/api/v3/ticker/price",
    {
      params: { symbol },
    }
  );
  return Number(res.data.price);
}

(async () => {
  await redisSub.connect();
  await redisPub.connect();

  console.log("✅ Execution service connected to Redis");
  console.log("✅ Execution service connected to DB");

  await redisSub.subscribe("commands:order:submit", async (message) => {
    const command = JSON.parse(message);

    // 1️⃣ Check if order was canceled
    const order = await prisma.order.findUnique({
      where: { id: command.orderId },
    });

    if (!order || order.status === "CANCELED") {
      console.log("⏭️ Order canceled, skipping:", command.orderId);
      return;
    }

    console.log("⚡ Executing order:", command.orderId);

    // 2️⃣ Fetch real market price
    const marketPrice = await getMarketPrice(command.symbol);

    // 3️⃣ Update DB
    const updatedOrder = await prisma.order.update({
      where: { id: command.orderId },
      data: {
        status: "FILLED",
        price: marketPrice,
      },
    });

    // 4️⃣ Publish execution event
    await redisPub.publish(
      "events:order:status",
      JSON.stringify({
        orderId: updatedOrder.id,
        email: command.userId,
        symbol: command.symbol,
        side: command.side,
        type: command.type,
        quantity: command.quantity,
        status: "FILLED",
        price: marketPrice,
        timestamp: Date.now(),
      })
    );

    console.log(
      `✅ Order executed @ ${marketPrice} (${command.symbol})`
    );
  });
})();
