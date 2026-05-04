"use client";

import AppLayout from "@/components/AppLayout";
import DashboardCard from "@/components/DashboardCard";
import DashboardCharts from "@/components/charts/DashboardCharts";
import { useEffect, useMemo, useState } from "react";

type DashboardStats = {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  todaySalesAmount: number;
  totalRevenue: number;
  totalPurchaseAmount: number;
  expiringSoonCount: number;
};

type Transaction = {
  id: string;
  date: string;
  type: "Sale" | "Purchase";
  ref: string;
  party: string;
  product: string;
  amount: number;
  status: string;
  createdAt: string;
};

type LowStockProduct = {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  barcode?: string;
};

type ExpiringProduct = {
  _id: string;
  name: string;
  category: string;
  brand?: string;
  quantity: number;
  unit: string;
  supplier?: string;
  expiryDate: string;
  barcode?: string;
};

type DashboardData = {
  stats: DashboardStats;
  recentTransactions: Transaction[];
  lowStockList: LowStockProduct[];
  expiringSoonList: ExpiringProduct[];
  stockDistribution: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
};

const defaultData: DashboardData = {
  stats: {
    totalProducts: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    inStockProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    todaySalesAmount: 0,
    totalRevenue: 0,
    totalPurchaseAmount: 0,
    expiringSoonCount: 0,
  },
  recentTransactions: [],
  lowStockList: [],
  expiringSoonList: [],
  stockDistribution: {
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  },
};

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDaysLeft(expiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchDashboard() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.message || "Failed to load dashboard");
        return;
      }

      setData({
        stats: result.stats || defaultData.stats,
        recentTransactions: result.recentTransactions || [],
        lowStockList: result.lowStockList || [],
        expiringSoonList: result.expiringSoonList || [],
        stockDistribution: result.stockDistribution || defaultData.stockDistribution,
      });
    } catch {
      setMessage("Something went wrong while loading dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchDashboard();
    };

    loadData();
  }, []);

  const cards = useMemo(
    () => [
      {
        title: "Total Products",
        value: String(data.stats.totalProducts),
        icon: "📦",
        color: "bg-blue-100 text-blue-600",
        linkText: "View all products",
      },
      {
        title: "Total Categories",
        value: String(data.stats.totalCategories),
        icon: "🏷️",
        color: "bg-purple-100 text-purple-600",
        linkText: "View categories",
      },
      {
        title: "Total Suppliers",
        value: String(data.stats.totalSuppliers),
        icon: "👥",
        color: "bg-green-100 text-green-600",
        linkText: "View suppliers",
      },
      {
        title: "Low Stock Items",
        value: String(
          data.stats.lowStockProducts + data.stats.outOfStockProducts
        ),
        icon: "⚠️",
        color: "bg-orange-100 text-orange-600",
        linkText: "View low stock",
      },
      {
        title: "Expiring Soon",
        value: String(data.stats.expiringSoonCount),
        icon: "⏰",
        color: "bg-yellow-100 text-yellow-600",
        linkText: "View expiry",
      },
      {
        title: "Today Sales",
        value: formatCurrency(data.stats.todaySalesAmount),
        icon: "🛒",
        color: "bg-cyan-100 text-cyan-600",
        linkText: "View sales",
      },
      {
        title: "Total Revenue",
        value: formatCurrency(data.stats.totalRevenue),
        icon: "💳",
        color: "bg-indigo-100 text-indigo-600",
        linkText: "View reports",
      },
    ],
    [data]
  );

  const totalStockCount =
    data.stockDistribution.inStock +
    data.stockDistribution.lowStock +
    data.stockDistribution.outOfStock;

  const inStockPercent =
    totalStockCount > 0
      ? Math.round((data.stockDistribution.inStock / totalStockCount) * 100)
      : 0;

  return (
    <AppLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, Admin 👋
          </h1>
          <p className="mt-1 text-slate-500">
            Dashboard is connected with real MongoDB data, charts and expiry
            alerts.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Refresh Dashboard
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading dashboard data...
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <DashboardCard key={card.title} {...card} />
            ))}
          </section>

          <DashboardCharts
            totalRevenue={data.stats.totalRevenue}
            totalPurchaseAmount={data.stats.totalPurchaseAmount}
            inStock={data.stockDistribution.inStock}
            lowStock={data.stockDistribution.lowStock}
            outOfStock={data.stockDistribution.outOfStock}
            expiringSoonCount={data.stats.expiringSoonCount}
          />

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Transactions
                </h2>

                <span className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
                  Real Data
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Reference No.</th>
                      <th className="px-4 py-3 font-medium">Party</th>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.recentTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          No recent transactions found.
                        </td>
                      </tr>
                    ) : (
                      data.recentTransactions.map((item) => (
                        <tr key={item.id} className="border-t border-slate-100">
                          <td className="px-4 py-4 text-slate-700">
                            {formatDate(item.date)}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.type === "Sale"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-800">
                            {item.ref}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {item.party}
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-900">
                            {item.product}
                          </td>

                          <td className="px-4 py-4 font-semibold text-slate-900">
                            {formatCurrency(item.amount)}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Low Stock Alerts
                </h2>

                <span className="rounded-xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                  {data.lowStockList.length} Items
                </span>
              </div>

              <div className="space-y-5">
                {data.lowStockList.length === 0 ? (
                  <div className="rounded-2xl bg-green-50 p-5 text-sm font-semibold text-green-700">
                    Great! No low stock products.
                  </div>
                ) : (
                  data.lowStockList.map((item) => {
                    const percent =
                      item.minStock > 0
                        ? Math.min(
                            100,
                            Math.round((item.quantity / item.minStock) * 100)
                          )
                        : 0;

                    return (
                      <div key={item._id}>
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.category} | {item.barcode || "No barcode"}
                            </p>
                          </div>

                          <p
                            className={`font-semibold ${
                              item.status === "out-of-stock"
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          >
                            {item.quantity} / {item.minStock} {item.unit}
                          </p>
                        </div>

                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full ${
                              item.status === "out-of-stock"
                                ? "bg-red-500"
                                : "bg-orange-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Stock Distribution
              </h2>

              <div className="flex h-56 items-center justify-center rounded-2xl bg-slate-50">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-28 w-28 items-center justify-center rounded-full border-[18px] border-green-500 text-xl font-bold">
                    {inStockPercent}%
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    In Stock Products
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {data.stockDistribution.inStock} in stock,{" "}
                    {data.stockDistribution.lowStock} low,{" "}
                    {data.stockDistribution.outOfStock} out
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Business Insights
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-green-50 p-5">
                  <p className="text-sm text-green-700">Total Revenue</p>
                  <h3 className="mt-2 text-2xl font-bold text-green-700">
                    {formatCurrency(data.stats.totalRevenue)}
                  </h3>
                  <p className="mt-1 text-xs text-green-600">
                    From all sales
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-5">
                  <p className="text-sm text-blue-700">Total Purchase</p>
                  <h3 className="mt-2 text-2xl font-bold text-blue-700">
                    {formatCurrency(data.stats.totalPurchaseAmount)}
                  </h3>
                  <p className="mt-1 text-xs text-blue-600">
                    Purchase investment
                  </p>
                </div>

                <div className="rounded-2xl bg-purple-50 p-5">
                  <p className="text-sm text-purple-700">Estimated Profit</p>
                  <h3 className="mt-2 text-2xl font-bold text-purple-700">
                    {formatCurrency(
                      data.stats.totalRevenue - data.stats.totalPurchaseAmount
                    )}
                  </h3>
                  <p className="mt-1 text-xs text-purple-600">
                    Revenue - Purchase
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-yellow-50 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-yellow-800">
                      Expiry Alerts
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Products expired or expiring within 30 days.
                    </p>
                  </div>

                  <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
                    {data.stats.expiringSoonCount} Items
                  </span>
                </div>

                <div className="space-y-3">
                  {data.expiringSoonList.length === 0 ? (
                    <p className="text-sm font-semibold text-green-700">
                      No expiry alert products found.
                    </p>
                  ) : (
                    data.expiringSoonList.map((product) => {
                      const daysLeft = getDaysLeft(product.expiryDate);

                      return (
                        <div
                          key={product._id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.category} | {product.quantity}{" "}
                              {product.unit}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold text-yellow-700">
                              {formatDate(product.expiryDate)}
                            </p>

                            <p
                              className={`text-xs font-semibold ${
                                daysLeft < 0
                                  ? "text-red-600"
                                  : daysLeft <= 7
                                  ? "text-orange-600"
                                  : "text-yellow-700"
                              }`}
                            >
                              {daysLeft < 0
                                ? `Expired ${Math.abs(daysLeft)} days ago`
                                : `${daysLeft} days left`}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
}