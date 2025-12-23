"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { logout } from "../lib/auth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  if (!mounted) {
    return (
      <html>
        <body className="bg-gray-900 text-white min-h-screen" />
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <header className="border-b border-gray-800 bg-black">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
            <h1 className="text-xl font-semibold">Trading Platform</h1>

            <nav className="space-x-6 text-sm">
              {!loggedIn ? (
                <>
                  <Link href="/login" className="text-gray-300 hover:text-white">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-gray-300 hover:text-white"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setLoggedIn(false);
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
