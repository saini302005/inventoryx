"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardChartsProps = {
  totalRevenue: number;
  totalPurchaseAmount: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  expiringSoonCount: number;
};

export default function DashboardCharts({
  totalRevenue,
  totalPurchaseAmount,
  inStock,
  lowStock,
  outOfStock,
  expiringSoonCount,
}: DashboardChartsProps) {
  const salesPurchaseData = [
    {
      name: "Sales",
      amount: totalRevenue,
    },
    {
      name: "Purchase",
      amount: totalPurchaseAmount,
    },
  ];

  const stockData = [
    { name: "In Stock", value: inStock, fill: "#22c55e" },
    { name: "Low Stock", value: lowStock, fill: "#f97316" },
    { name: "Out of Stock", value: outOfStock, fill: "#ef4444" },
  ];

  const expiryData = [
    {
      name: "Expiry Alerts",
      value: expiringSoonCount,
    },
  ];

  return (
    <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Sales vs Purchase Chart
          </h2>
          <p className="text-sm text-slate-500">
            Compare total revenue with total purchase investment.
          </p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesPurchaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
              <Legend />
              <Bar dataKey="amount" name="Amount">
                <Cell fill="#2563eb" />
                <Cell fill="#16a34a" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Stock Status Chart
          </h2>
          <p className="text-sm text-slate-500">
            Product stock health overview.
          </p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stockData}
                dataKey="value"
                nameKey="name"
                outerRadius={95}
                label
              >
                {stockData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Expiry Alert Overview
            </h2>
            <p className="text-sm text-slate-500">
              Products expired or expiring within 30 days.
            </p>
          </div>

          <span className="rounded-2xl bg-yellow-100 px-5 py-3 text-sm font-bold text-yellow-700">
            {expiringSoonCount} Items
          </span>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expiryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="Products" fill="#eab308" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}