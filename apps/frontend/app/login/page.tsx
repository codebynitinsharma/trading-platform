"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

     localStorage.setItem("token", data.token);

// Force layout to re-evaluate auth state
      window.location.href = "/trade";

    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Login
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-smzsm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-medium"
        >
          Login
        </button>
      </form>
    </div>
  );
}