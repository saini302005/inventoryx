"use client";

import AppLayout from "@/components/AppLayout";
import { useCallback, useEffect, useMemo, useState } from "react";

type Product = {
  _id: string;
  name: string;
  category: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minStock: number;
  unit: string;
  supplier: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  barcode?: string;
  expiryDate?: string | null;
};

export default function LowStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const refetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/products", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load low stock products");
        return;
      }

      const filtered = data.products.filter(
        (product: Product) =>
          product.status === "low-stock" || product.status === "out-of-stock"
      );

      setProducts(filtered);
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await refetchData();
    };

    loadData();
  }, [refetchData]);

  const stats = useMemo(() => {
    const lowStock = products.filter((p) => p.status === "low-stock").length;
    const outOfStock = products.filter((p) => p.status === "out-of-stock").length;
    const totalValueAtRisk = products.reduce(
      (total, product) => total + product.quantity * product.purchasePrice,
      0
    );

    return { lowStock, outOfStock, totalValueAtRisk };
  }, [products]);

  function formatCurrency(value: number) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  return (
    <AppLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Low Stock Alerts</h1>
          <p className="mt-1 text-slate-500">
            Track products that need urgent restocking.
          </p>
        </div>

        <button
          onClick={refetchData}
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
          <p className="text-sm text-slate-500">Low Stock Items</p>
          <h2 className="mt-2 text-3xl font-bold text-orange-600">
            {stats.lowStock}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Out of Stock Items</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {stats.outOfStock}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Current Value At Risk</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {formatCurrency(stats.totalValueAtRisk)}
          </h2>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Products Needing Attention
          </h2>
          <p className="text-sm text-slate-500">
            These products are below minimum stock or completely out of stock.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Current Stock</th>
                <th className="px-4 py-3 font-medium">Min Stock</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action Needed</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    Loading low stock products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center font-semibold text-green-600"
                  >
                    Great! No low stock products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
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

                    <td className="px-4 py-4 font-bold text-red-600">
                      {product.quantity} {product.unit}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {product.minStock}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {product.supplier || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          product.status === "out-of-stock"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {product.status === "out-of-stock"
                          ? "Out of Stock"
                          : "Low Stock"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        Purchase Required
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