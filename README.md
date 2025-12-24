# 🚀 Trading Platform (Binance Testnet)

A full-stack, event-driven crypto trading platform built for learning and experimentation.  
This project simulates a real trading system using modern backend architecture and real-time frontend updates.

> ⚠️ **Testnet only** — No real funds are used.

---

## ✨ Features

- 🔐 JWT-based authentication (Register / Login)
- 📈 Place market orders (BUY / SELL)
- ❌ Cancel open orders
- 🗂 Order history (PostgreSQL → UI)
- ⚡ Real-time execution pipeline
- 📡 Live updates via WebSockets
- 💰 Real BTCUSDT prices from Binance Testnet
- 🌗 Dark / Light theme toggle
- 🎨 Animated gradient landing page
## 🏗 Architecture Overview

Frontend (Next.js)
   ↓ REST + WebSocket
Backend API (Express)
   ↓ Prisma ORM
PostgreSQL (Docker)
   ↓
Redis (Pub/Sub)
   ↓
Execution Service
   ↓
Binance Testnet API
   ↓
Event Service
   ↓
WebSocket → Frontend


---

### API Documentation

```md
## 📡 API Documentation

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Trading
- `GET /api/trading/orders` (protected)
- `POST /api/trading/orders`
- `POST /api/trading/orders/:id/cancel`

### WebSocket
- `ws://<event-service>?token=<JWT>`
## ⚖️ Trade-offs

- Orders are filled instantly (no order book)
- Single Redis instance (no clustering)
- JWT stored in localStorage for simplicity
- No refresh tokens implemented
## 🔮 Future Improvements

- Real order book matching
- Rate limiting & request validation
- Refresh token auth
- User balances & PnL
- Redis Streams instead of Pub/Sub
## 🤖 AI Assistance Disclosure

Parts of this project were developed with the assistance of ChatGPT.
All code was reviewed, understood, and integrated manually.

## .env details
DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379

DATABASE_URL=postgresql://user:password@localhost:5432/db
REDIS_URL=redis://localhost:6379

REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret

## 🌍 Live Deployment

Frontend: https://your-app.vercel.app  
Backend: https://your-api.up.railway.app
