"use client";

import AppLayout from "@/components/AppLayout";
import { useState } from "react";

export default function SettingsPage() {
  const [shopName, setShopName] = useState("InventoryX Store");
  const [ownerName, setOwnerName] = useState("Sanju Admin");
  const [currency, setCurrency] = useState("INR");
  const [lowStockRule, setLowStockRule] = useState(true);
  const [message, setMessage] = useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Settings saved successfully ✅");
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-500">
          Configure basic shop preferences and business rules.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Business Settings
          </h2>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Shop Name
              </label>
              <input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Owner / Admin Name
              </label>
              <input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Prevent Sale If Stock Is Not Enough
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    This rule is already active in Sales API. Keep it enabled for
                    safe inventory control.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setLowStockRule(!lowStockRule)}
                  className={`rounded-full px-5 py-2 text-sm font-bold ${
                    lowStockRule
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {lowStockRule ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {message && (
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Save Settings
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Project Info
          </h2>

          <div className="space-y-4 text-sm">
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="font-bold text-blue-700">Project Name</p>
              <p className="mt-1 text-blue-700">InventoryX</p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4">
              <p className="font-bold text-green-700">Tech Stack</p>
              <p className="mt-1 text-green-700">
                Next.js, MongoDB, Tailwind CSS
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-4">
              <p className="font-bold text-purple-700">Modules</p>
              <p className="mt-1 text-purple-700">
                Products, Suppliers, Purchases, Sales, Reports
              </p>
            </div>

            <div className="rounded-2xl bg-orange-50 p-4">
              <p className="font-bold text-orange-700">Status</p>
              <p className="mt-1 text-orange-700">Demo Ready</p>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}