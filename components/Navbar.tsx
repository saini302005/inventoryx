"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) return;

    router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
    setQuery("");
  }

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-8 backdrop-blur">
      <form onSubmit={handleSearch} className="relative w-[420px]">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, invoices, suppliers..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
        />
      </form>

      <div className="flex items-center gap-5">
        <button className="relative rounded-2xl border border-slate-200 bg-white p-3 hover:bg-slate-50">
          🔔
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-xl">
            👨‍💼
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Admin</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}