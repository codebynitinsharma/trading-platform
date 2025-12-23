"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ============================
   TYPES
============================ */
type OrderEvent = {
  orderId: string;
  symbol: string;
  side: string;
  type: string;
  quantity: number;
  status: string;
  price: number;
  timestamp: number;
};

type Order = {
  id: string;
  symbol: string;
  side: string;
  quantity: number;
  status: string;
  price: number | null;
  createdAt: string;
};

export default function TradePage() {
  const router = useRouter();

  /* ============================
     STATE
  ============================ */
  const [email, setEmail] = useState<string | null>(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [side, setSide] = useState("BUY");
  const [type, setType] = useState("MARKET");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");

  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  /* ============================
     AUTH + WEBSOCKET
  ============================ */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    let ws: WebSocket | null = null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setEmail(payload.email);

      ws = new WebSocket(`ws://localhost:4000?token=${token}`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setEvents((prev) => [data, ...prev]);
      };

      ws.onerror = () => {
        console.warn("WebSocket error (ignored)");
      };
    } catch {
      router.push("/login");
    }

    return () => {
      if (ws) ws.close();
    };
  }, [router]);

  /* ============================
     FETCH ORDER HISTORY
  ============================ */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trading/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrderHistory(data.orders || []);
      })
      .catch(() => {
        console.error("Failed to load order history");
      });
  }, []);

  /* ============================
     PLACE ORDER
  ============================ */
  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trading/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            symbol,
            side,
            type,
            quantity: Number(quantity),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Order failed");
        return;
      }

      setMessage(`✅ Order submitted. ID: ${data.orderId}`);
      setQuantity("");
    } catch {
      setMessage("❌ Network error");
    }
  }

  /* ============================
     CANCEL ORDER
  ============================ */
  async function cancelOrder(orderId: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/trading/orders/${orderId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setOrderHistory((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "CANCELED" } : o
      )
    );
  }

  /* ============================
     RENDER GUARD
  ============================ */
  if (!email) return null;

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Trading Dashboard</h1>
        <p className="text-gray-400">
          Logged in as <span className="text-white">{email}</span>
        </p>
      </div>

      {/* PLACE ORDER */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Place Order</h2>

        <form
          onSubmit={placeOrder}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-3 py-2 rounded"
          />

          <select
            value={side}
            onChange={(e) => setSide(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-3 py-2 rounded"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-3 py-2 rounded"
          >
            <option value="MARKET">MARKET</option>
            <option value="LIMIT">LIMIT</option>
          </select>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-3 py-2 rounded"
            placeholder="Quantity"
          />

          <button
            type="submit"
            className="md:col-span-4 bg-blue-600 hover:bg-blue-700 py-2 rounded"
          >
            Place Order
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-gray-300">{message}</p>
        )}
      </div>

      {/* LIVE EVENTS */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Live Order Events</h2>

        {events.length === 0 ? (
          <p className="text-gray-400 text-sm">No events yet</p>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li
                key={e.orderId + e.timestamp}
                className="bg-gray-900 border border-gray-700 px-3 py-2 rounded text-sm"
              >
                <strong>{e.symbol}</strong> {e.side} – {e.status} @ {e.price}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ORDER HISTORY */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Order History</h2>

        {orderHistory.length === 0 ? (
          <p className="text-gray-400 text-sm">No orders yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="text-left py-2">Symbol</th>
                <th className="text-left py-2">Side</th>
                <th className="text-left py-2">Qty</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Price</th>
                <th className="text-left py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {orderHistory.map((o) => (
                <tr key={o.id} className="border-b border-gray-700">
                  <td className="py-2">{o.symbol}</td>
                  <td className="py-2">{o.side}</td>
                  <td className="py-2">{o.quantity}</td>
                  <td className="py-2">{o.status}</td>
                  <td className="py-2">{o.price ?? "-"}</td>
                  <td className="py-2">
                    {o.status === "SUBMITTED" && (
                      <button
                        onClick={() => cancelOrder(o.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
