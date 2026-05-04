"use client";

import AppLayout from "@/components/AppLayout";
import { useEffect, useMemo, useState } from "react";

type Category = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
};

const emptyCategory = {
  name: "",
  description: "",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyCategory);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [editingId, setEditingId] = useState("");

  async function fetchCategories(searchValue = "") {
    try {
      setTableLoading(true);

      const res = await fetch(`/api/categories?search=${searchValue}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch {
      setMessage("Failed to load categories");
    } finally {
      setTableLoading(false);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
    };

    loadData();
  }, []);

  const totalCategories = useMemo(() => categories.length, [categories]);

  function startEdit(category: Category) {
    setEditingId(category._id);
    setForm({
      name: category.name || "",
      description: category.description || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId("");
    setForm(emptyCategory);
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url = editingId
        ? `/api/categories/${editingId}`
        : "/api/categories";

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
        setMessage(data.message || "Failed to save category");
        return;
      }

      setMessage(
        editingId
          ? "Category updated successfully ✅"
          : "Category added successfully ✅"
      );

      setForm(emptyCategory);
      setEditingId("");
      fetchCategories(search);
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete category");
        return;
      }

      setMessage("Category deleted successfully ✅");
      fetchCategories(search);
    } catch {
      setMessage("Delete failed");
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchCategories(search);
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
        <p className="mt-1 text-slate-500">
          Manage product categories for better inventory organization.
        </p>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Categories</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {totalCategories}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Main Purpose</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Product Grouping
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Examples</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Electronics, Grocery
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Edit Category" : "Add Category"}
            </h2>
            <p className="text-sm text-slate-500">
              {editingId
                ? "Update category details."
                : "Create a new product category."}
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
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Electronics"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="All electronic items"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
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
                ? "Update Category"
                : "Save Category"}
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
              Categories List
            </h2>
            <p className="text-sm text-slate-500">
              Search, edit and manage product categories.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category..."
              className="w-72 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
              Search
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchCategories("");
              }}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Category Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Created At</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tableLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="border-t border-slate-100">
                    <td className="px-4 py-4 font-bold text-slate-900">
                      {category.name}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {category.description || "-"}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(category._id)}
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