require("dotenv").config();

const { createClient } = require("redis");
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

/* ---------------- Redis Client (SUBSCRIBE ONLY) ---------------- */

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => {
  console.error("Redis error (event-service):", err);
});

/* ---------------- WebSocket Server ---------------- */

const wss = new WebSocket.Server({ port: 4000 });
const userSockets = new Map(); // email -> WebSocket

wss.on("connection", (ws, req) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) {
      throw new Error("Token missing");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload.email) {
      throw new Error("JWT payload missing email");
    }

    console.log("WS authenticated user:", payload.email);

    userSockets.set(payload.email, ws);

    ws.on("close", () => {
      userSockets.delete(payload.email);
      console.log("WS disconnected:", payload.email);
    });

  } catch (err) {
    console.error("WS auth error:", err.message);
    ws.close();
  }
});

/* ---------------- Redis Subscription ---------------- */

(async () => {
  await redis.connect();
  console.log("Event service connected to Redis");

  await redis.subscribe("events:order:status", (message) => {
    console.log("EVENT RECEIVED FROM REDIS:", message);

    const event = JSON.parse(message);

    console.log("LOOKING FOR WS USER:", event.email);
    console.log("CURRENT WS USERS:", [...userSockets.keys()]);

    const ws = userSockets.get(event.email);
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("SENDING EVENT TO WS");
      ws.send(JSON.stringify(event));
    } else {
      console.log("NO ACTIVE WS FOR USER");
    }
  });
})();
