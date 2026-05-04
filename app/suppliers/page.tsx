"use client";

import AppLayout from "@/components/AppLayout";
import { useEffect, useMemo, useState } from "react";

type Supplier = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  companyName: string;
  status: "active" | "inactive";
  createdAt: string;
};

const emptySupplier = {
  name: "",
  phone: "",
  email: "",
  address: "",
  companyName: "",
  status: "active",
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState(emptySupplier);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [editingId, setEditingId] = useState("");

  async function fetchSuppliers(searchValue = "") {
    try {
      setTableLoading(true);

      const res = await fetch(`/api/suppliers?search=${searchValue}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setSuppliers(data.suppliers);
      }
    } catch {
      setMessage("Failed to load suppliers");
    } finally {
      setTableLoading(false);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchSuppliers();
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter((s) => s.status === "active").length;
    const inactive = suppliers.filter((s) => s.status === "inactive").length;

    return { total, active, inactive };
  }, [suppliers]);

  function startEdit(supplier: Supplier) {
    setEditingId(supplier._id);
    setForm({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      companyName: supplier.companyName || "",
      status: supplier.status || "active",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId("");
    setForm(emptySupplier);
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url = editingId ? `/api/suppliers/${editingId}` : "/api/suppliers";
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
        setMessage(data.message || "Failed to save supplier");
        return;
      }

      setMessage(
        editingId
          ? "Supplier updated successfully ✅"
          : "Supplier added successfully ✅"
      );

      setForm(emptySupplier);
      setEditingId("");
      fetchSuppliers(search);
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Are you sure you want to delete this supplier?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete supplier");
        return;
      }

      setMessage("Supplier deleted successfully ✅");
      fetchSuppliers(search);
    } catch {
      setMessage("Delete failed");
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchSuppliers(search);
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Suppliers</h1>
        <p className="mt-1 text-slate-500">
          Manage supplier details, company information, and contact records.
        </p>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Suppliers</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">{stats.total}</h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active Suppliers</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {stats.active}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Inactive Suppliers</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {stats.inactive}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Edit Supplier" : "Add Supplier"}
            </h2>
            <p className="text-sm text-slate-500">
              {editingId
                ? "Update supplier details."
                : "Create a new supplier record."}
            </p>
          </div>

          {editingId && (
            <button
              onClick={cancelEdit}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Supplier Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Rajesh Kumar"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Company Name *
            </label>
            <input
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
              placeholder="RK Traders"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Phone *
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="supplier@example.com"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Address
            </label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Mumbai, Maharashtra"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end xl:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl px-5 py-3 text-sm font-bold text-white disabled:opacity-60 ${
                editingId
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Supplier"
                : "Save Supplier"}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            {message}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Suppliers List
            </h2>
            <p className="text-sm text-slate-500">
              Search, edit and manage supplier records.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search supplier..."
              className="w-72 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
              Search
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchSuppliers("");
              }}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Supplier Name</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created At</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tableLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    Loading suppliers...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier._id} className="border-t border-slate-100">
                    <td className="px-4 py-4 font-bold text-slate-900">
                      {supplier.name}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {supplier.companyName}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {supplier.phone}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {supplier.email || "-"}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {supplier.address || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          supplier.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {supplier.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {new Date(supplier.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(supplier)}
                          className="rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(supplier._id)}
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