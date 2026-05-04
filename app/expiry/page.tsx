"use client";

import AppLayout from "@/components/AppLayout";
import { useEffect, useMemo, useState } from "react";

type ExpiryProduct = {
  _id: string;
  name: string;
  category: string;
  brand: string;
  quantity: number;
  unit: string;
  supplier: string;
  expiryDate: string;
  barcode?: string;
  daysLeft: number;
  expiryStatus: "expired" | "critical" | "expiring-soon" | "safe";
};

type ExpiryData = {
  summary: {
    expired: number;
    critical: number;
    expiringSoon: number;
  };
  products: ExpiryProduct[];
};

const defaultData: ExpiryData = {
  summary: {
    expired: 0,
    critical: 0,
    expiringSoon: 0,
  },
  products: [],
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ExpiryPage() {
  const [data, setData] = useState<ExpiryData>(defaultData);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchExpiry() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/expiry", {
        cache: "no-store",
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.message || "Failed to load expiry data");
        return;
      }

      setData({
        summary: result.summary,
        products: result.products,
      });
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchExpiry();
    };

    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (filter === "all") return data.products;
    return data.products.filter((product) => product.expiryStatus === filter);
  }, [data.products, filter]);

  function badgeClass(status: ExpiryProduct["expiryStatus"]) {
    if (status === "expired") return "bg-red-100 text-red-700";
    if (status === "critical") return "bg-orange-100 text-orange-700";
    if (status === "expiring-soon") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  }

  function statusText(product: ExpiryProduct) {
    if (product.expiryStatus === "expired") {
      return `Expired ${Math.abs(product.daysLeft)} days ago`;
    }

    if (product.expiryStatus === "critical") {
      return `${product.daysLeft} days left`;
    }

    if (product.expiryStatus === "expiring-soon") {
      return `${product.daysLeft} days left`;
    }

    return "Safe";
  }

  return (
    <AppLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Expiry Alerts
          </h1>
          <p className="mt-1 text-slate-500">
            Track products that are expired or expiring soon.
          </p>
        </div>

        <button
          onClick={fetchExpiry}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      )}

      <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Expired Products</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {data.summary.expired}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Critical Expiry</p>
          <h2 className="mt-2 text-3xl font-bold text-orange-600">
            {data.summary.critical}
          </h2>
          <p className="mt-1 text-xs text-slate-500">0–7 days left</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Expiring Soon</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-600">
            {data.summary.expiringSoon}
          </h2>
          <p className="mt-1 text-xs text-slate-500">8–30 days left</p>
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {[
            { id: "all", label: "All" },
            { id: "expired", label: "Expired" },
            { id: "critical", label: "Critical" },
            { id: "expiring-soon", label: "Expiring Soon" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-2xl px-5 py-3 text-sm font-bold ${
                filter === item.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Expiry Products List
          </h2>
          <p className="text-sm text-slate-500">
            Products shown here need expiry attention.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Expiry Date</th>
                <th className="px-4 py-3 font-medium">Expiry Status</th>
                <th className="px-4 py-3 font-medium">Action Needed</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading expiry products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center font-semibold text-green-600"
                  >
                    No expiry alert products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="border-t border-slate-100">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        {product.barcode || "No barcode"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {product.category}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {product.brand || "-"}
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900">
                      {product.quantity} {product.unit}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {product.supplier || "-"}
                    </td>

                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {formatDate(product.expiryDate)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass(
                          product.expiryStatus
                        )}`}
                      >
                        {statusText(product)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {product.expiryStatus === "expired"
                          ? "Remove Stock"
                          : "Sell / Return Soon"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}