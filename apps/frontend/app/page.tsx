"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  // Persist theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <main
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* =========================
          ANIMATED BACKGROUND
      ========================= */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            isDark
              ? "from-blue-900/30 via-cyan-900/20 to-transparent"
              : "from-blue-200 via-cyan-200 to-transparent"
          } animate-gradient`}
        />
      </div>

      {/* =========================
          HEADER / TOGGLE
      ========================= */}
      <header className="flex justify-end px-6 py-4">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`px-4 py-2 rounded-full text-sm border transition ${
            isDark
              ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
              : "border-gray-300 bg-white hover:bg-gray-200"
          }`}
        >
          {isDark ? "🌞 Light mode" : "🌙 Dark mode"}
        </button>
      </header>

      {/* =========================
          HERO
      ========================= */}
      <section className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Real-Time Crypto Trading
            </span>
            <br />
            Built on Modern Architecture
          </h1>

          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            An event-driven trading platform with live execution,
            WebSocket updates, and real Binance Testnet prices.
          </p>

          <div className="flex justify-center gap-4 pt-2">
            <a
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 px-7 py-3 rounded-lg font-medium text-white transition"
            >
              Get Started
            </a>

            <a
              href="/login"
              className={`px-7 py-3 rounded-lg font-medium border transition ${
                isDark
                  ? "border-gray-600 hover:border-gray-400"
                  : "border-gray-400 hover:border-gray-600"
              }`}
            >
              Login
            </a>
          </div>

          <p className="text-gray-400 text-sm">
            Testnet only • No real funds involved
          </p>
        </div>
      </section>

      {/* =========================
          FEATURE STRIP
      ========================= */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              title: "⚡ Real-Time Execution",
              desc: "Redis-powered event pipeline with instant execution.",
            },
            {
              title: "📡 Live Prices",
              desc: "Real BTCUSDT prices from Binance Testnet.",
            },
            {
              title: "🧱 Production Stack",
              desc: "Next.js, Node.js, PostgreSQL, Redis, Prisma.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`rounded-xl p-6 border transition backdrop-blur ${
                isDark
                  ? "bg-gray-800/80 border-gray-700 hover:border-blue-500"
                  : "bg-white/80 border-gray-300 hover:border-blue-500"
              }`}
            >
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        Built for learning & experimentation • Testnet only
      </footer>

      {/* =========================
          GRADIENT ANIMATION
      ========================= */}
      <style jsx>{`
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 20s ease infinite;
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </main>
  );
}