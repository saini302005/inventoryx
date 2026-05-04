"use client";

import AppLayout from "@/components/AppLayout";
import { useCallback, useEffect, useMemo, useState } from "react";

type Customer = {
  id: string;
  customerName: string;
  customerPhone: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate: string;
  products: string[];
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/customers", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load customers");
        return;
      }

      setCustomers(data.customers || []);
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadCustomers = async () => {
      await fetchCustomers();
    };

    loadCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const keyword = search.toLowerCase();

    return customers.filter(
      (customer) =>
        customer.customerName.toLowerCase().includes(keyword) ||
        customer.customerPhone.toLowerCase().includes(keyword) ||
        customer.products.join(" ").toLowerCase().includes(keyword)
    );
  }, [customers, search]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalOrders = customers.reduce((total, c) => total + c.totalOrders, 0);
    const totalSpent = customers.reduce((total, c) => total + c.totalSpent, 0);

    return { totalCustomers, totalOrders, totalSpent };
  }, [customers]);

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

  return (
    <AppLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-slate-500">
            Customer records are generated automatically from sales history.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
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
          <p className="text-sm text-slate-500">Total Customers</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {stats.totalCustomers}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Orders</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {stats.totalOrders}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Customer Revenue</p>
          <h2 className="mt-2 text-3xl font-bold text-purple-600">
            {formatCurrency(stats.totalSpent)}
          </h2>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Customer List</h2>
            <p className="text-sm text-slate-500">
              Search customer by name, phone or purchased product.
            </p>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer..."
            className="w-80 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total Spent</th>
                <th className="px-4 py-3 font-medium">Products Purchased</th>
                <th className="px-4 py-3 font-medium">Last Purchase</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-t border-slate-100">
                    <td className="px-4 py-4 font-bold text-slate-900">
                      {customer.customerName}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {customer.customerPhone || "-"}
                    </td>

                    <td className="px-4 py-4 font-bold text-blue-600">
                      {customer.totalOrders}
                    </td>

                    <td className="px-4 py-4 font-bold text-green-600">
                      {formatCurrency(customer.totalSpent)}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {customer.products.join(", ")}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {formatDate(customer.lastPurchaseDate)}
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