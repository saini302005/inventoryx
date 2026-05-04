"use client";

import AppLayout from "@/components/AppLayout";
import { useCallback, useEffect, useMemo, useState } from "react";

type Product = {
  _id: string;
  name: string;
  category: string;
  purchasePrice: number;
  quantity: number;
  minStock: number;
  unit: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
};

type Supplier = {
  _id: string;
  name: string;
  companyName: string;
  status: "active" | "inactive";
};

type Purchase = {
  _id: string;
  supplier: string;
  product: string;
  quantityPurchased: number;
  purchasePrice: number;
  totalAmount: number;
  oldStock: number;
  newStock: number;
  purchaseDate: string;
  createdAt: string;
};

const emptyPurchase = {
  supplier: "",
  productId: "",
  quantityPurchased: "",
  purchasePrice: "",
  purchaseDate: "",
};

export default function PurchasesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [form, setForm] = useState(emptyPurchase);
  const [message, setMessage] = useState("");
  const [stockMessage, setStockMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  const refetchData = useCallback(async () => {
    const productsRes = await fetch("/api/products", { cache: "no-store" });
    const productsData = await productsRes.json();
    if (productsData.success) {
      setProducts(productsData.products);
    }

    const suppliersRes = await fetch("/api/suppliers", { cache: "no-store" });
    const suppliersData = await suppliersRes.json();
    if (suppliersData.success) {
      setSuppliers(suppliersData.suppliers);
    }

    try {
      setTableLoading(true);
      const purchasesRes = await fetch("/api/purchases", { cache: "no-store" });
      const purchasesData = await purchasesRes.json();
      if (purchasesData.success) {
        setPurchases(purchasesData.purchases);
      }
    } catch {
      setMessage("Failed to load purchases");
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await refetchData();
    };

    loadData();
  }, [refetchData]);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product._id === form.productId);
  }, [products, form.productId]);

  const totalPurchaseAmount = useMemo(() => {
    return purchases.reduce((total, item) => total + item.totalAmount, 0);
  }, [purchases]);

  const totalStockAdded = useMemo(() => {
    return purchases.reduce((total, item) => total + item.quantityPurchased, 0);
  }, [purchases]);

  function handleProductChange(productId: string) {
    const product = products.find((item) => item._id === productId);

    setForm({
      ...form,
      productId,
      purchasePrice: product ? String(product.purchasePrice) : "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setStockMessage("");

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to add purchase");
        return;
      }

      setMessage("Purchase added successfully ✅");
      setStockMessage(
        `${data.stockUpdate.product}: Old Stock ${data.stockUpdate.oldStock} → Purchased ${data.stockUpdate.purchased} → New Stock ${data.stockUpdate.newStock}`
      );

      setForm(emptyPurchase);

      await refetchData();
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this purchase history?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete purchase");
        return;
      }

      setMessage("Purchase deleted successfully ✅");
      refetchData();
    } catch {
      setMessage("Delete failed");
    }
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Purchases</h1>
        <p className="mt-1 text-slate-500">
          Add supplier purchases and automatically increase product stock.
        </p>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Purchases</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {purchases.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Purchase Amount</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            ₹{totalPurchaseAmount}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Stock Added</p>
          <h2 className="mt-2 text-3xl font-bold text-orange-600">
            {totalStockAdded} units
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-slate-900">
          New Purchase Entry
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Supplier *
            </label>
            <select
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select supplier</option>
              {suppliers
                .filter((supplier) => supplier.status === "active")
                .map((supplier) => (
                  <option key={supplier._id} value={supplier.companyName}>
                    {supplier.companyName} - {supplier.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Product *
            </label>
            <select
              value={form.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} | Stock: {product.quantity} {product.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Quantity Purchased *
            </label>
            <input
              type="number"
              value={form.quantityPurchased}
              onChange={(e) =>
                setForm({ ...form, quantityPurchased: e.target.value })
              }
              placeholder="50"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Purchase Price *
            </label>
            <input
              type="number"
              value={form.purchasePrice}
              onChange={(e) =>
                setForm({ ...form, purchasePrice: e.target.value })
              }
              placeholder="600"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Purchase Date
            </label>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={(e) =>
                setForm({ ...form, purchaseDate: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end xl:col-span-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving Purchase..." : "Save Purchase & Update Stock"}
            </button>
          </div>
        </form>

        {selectedProduct && (
          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Selected Product:{" "}
            <span className="font-bold">{selectedProduct.name}</span> | Current
            Stock:{" "}
            <span className="font-bold">
              {selectedProduct.quantity} {selectedProduct.unit}
            </span>{" "}
            | Min Stock:{" "}
            <span className="font-bold">{selectedProduct.minStock}</span>
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            {message}
          </div>
        )}

        {stockMessage && (
          <div className="mt-3 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {stockMessage}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Purchase History
          </h2>
          <p className="text-sm text-slate-500">
            Every purchase entry is saved here with stock update details.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Qty Purchased</th>
                <th className="px-4 py-3 font-medium">Purchase Price</th>
                <th className="px-4 py-3 font-medium">Total Amount</th>
                <th className="px-4 py-3 font-medium">Stock Updated</th>
                <th className="px-4 py-3 font-medium">Purchase Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tableLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading purchases...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No purchases found.
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase._id} className="border-t border-slate-100">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {purchase.supplier}
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900">
                      {purchase.product}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {purchase.quantityPurchased}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      ₹{purchase.purchasePrice}
                    </td>

                    <td className="px-4 py-4 font-bold text-green-600">
                      ₹{purchase.totalAmount}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        {purchase.oldStock} → +{purchase.quantityPurchased} →{" "}
                        {purchase.newStock}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleDelete(purchase._id)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
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