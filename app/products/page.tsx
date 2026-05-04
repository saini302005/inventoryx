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
  expiryDate?: string | null;
  barcode: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  createdAt: string;
};

const emptyForm = {
  name: "",
  category: "",
  brand: "",
  purchasePrice: "",
  sellingPrice: "",
  quantity: "",
  minStock: "10",
  unit: "pcs",
  supplier: "",
  expiryDate: "",
  barcode: "",
};

function formatDateForInput(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTableLoading(true);

        const res = await fetch(`/api/products?search=${search}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
        }
      } catch {
        setMessage("Failed to load products");
      } finally {
        setTableLoading(false);
      }
    };

    fetchData();
  }, [search]);

  const refetchProducts = useCallback(async (searchValue = "") => {
    try {
      setTableLoading(true);

      const res = await fetch(`/api/products?search=${searchValue}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
      }
    } catch {
      setMessage("Failed to load products");
    } finally {
      setTableLoading(false);
    }
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.status === "in-stock").length;
    const lowStock = products.filter((p) => p.status === "low-stock").length;
    const outOfStock = products.filter((p) => p.status === "out-of-stock").length;

    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
    setMessage("");
  }

  function startEdit(product: Product) {
    setShowForm(true);
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      category: product.category || "",
      brand: product.brand || "",
      purchasePrice: String(product.purchasePrice ?? ""),
      sellingPrice: String(product.sellingPrice ?? ""),
      quantity: String(product.quantity ?? ""),
      minStock: String(product.minStock ?? "10"),
      unit: product.unit || "pcs",
      supplier: product.supplier || "",
      expiryDate: formatDateForInput(product.expiryDate),
      barcode: product.barcode || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Product save failed");
        return;
      }

      setMessage(
        editingId
          ? "Product updated successfully ✅"
          : "Product added successfully ✅"
      );

      setForm(emptyForm);
      setEditingId("");
      refetchProducts(search);
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    refetchProducts(search);
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete product");
        return;
      }

      setMessage("Product deleted successfully ✅");
      refetchProducts(search);
    } catch {
      setMessage("Delete failed");
    }
  }

  function statusBadge(status: Product["status"]) {
    if (status === "in-stock") return "bg-green-100 text-green-700";
    if (status === "low-stock") return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  }

  function statusText(status: Product["status"]) {
    if (status === "in-stock") return "In Stock";
    if (status === "low-stock") return "Low Stock";
    return "Out of Stock";
  }

  return (
    <AppLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Product Management
          </h1>
          <p className="mt-1 text-slate-500">
            Add, edit, search, manage, and track all inventory products.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          {showForm ? "Hide Form" : "+ Add Product"}
        </button>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Products</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {stats.total}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">In Stock</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {stats.inStock}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Low Stock</p>
          <h2 className="mt-2 text-3xl font-bold text-orange-600">
            {stats.lowStock}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Out of Stock</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {stats.outOfStock}
          </h2>
        </div>
      </section>

      {showForm && (
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? "Edit Product" : "Add Product"}
              </h2>
              <p className="text-sm text-slate-500">
                {editingId
                  ? "Update product details and save changes."
                  : "Fill product details and save it to MongoDB."}
              </p>
            </div>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Product Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Laptop"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Grocery">Grocery</option>
                <option value="Stationery">Stationery</option>
                <option value="Medicine">Medicine</option>
                <option value="Clothing">Clothing</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Brand
              </label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Dell / Amul / Samsung"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Supplier
              </label>
              <input
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Tech Supplies Pvt. Ltd."
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
                placeholder="42000"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Selling Price *
              </label>
              <input
                type="number"
                value={form.sellingPrice}
                onChange={(e) =>
                  setForm({ ...form, sellingPrice: e.target.value })
                }
                placeholder="52000"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Quantity *
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="15"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Minimum Stock *
              </label>
              <input
                type="number"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                placeholder="10"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Unit
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="box">box</option>
                <option value="pack">pack</option>
                <option value="unit">unit</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Barcode
              </label>
              <input
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                placeholder="BARCODE001"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Expiry Date
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({ ...form, expiryDate: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  editingId
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Save Product"}
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {message}
            </div>
          )}
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Products List</h2>
            <p className="text-sm text-slate-500">
              Search, edit, delete and manage all saved products.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, brand..."
              className="w-72 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                refetchProducts("");
              }}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1250px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Purchase</th>
                <th className="px-4 py-3 font-medium">Selling</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Min Stock</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Expiry</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tableLoading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No products found. Add your first product.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-t border-slate-100">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          {product.barcode || "No barcode"}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {product.category}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {product.brand || "-"}
                    </td>

                    <td className="px-4 py-4 font-medium text-slate-700">
                      ₹{product.purchasePrice}
                    </td>

                    <td className="px-4 py-4 font-medium text-slate-900">
                      ₹{product.sellingPrice}
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900">
                      {product.quantity} {product.unit}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {product.minStock}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {product.supplier || "-"}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {product.expiryDate
                        ? new Date(product.expiryDate).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge(
                          product.status
                        )}`}
                      >
                        {statusText(product.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(product._id)}
                          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
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