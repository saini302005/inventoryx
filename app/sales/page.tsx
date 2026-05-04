"use client";

import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  _id: string;
  name: string;
  category: string;
  sellingPrice: number;
  quantity: number;
  minStock: number;
  unit: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
};

type Sale = {
  _id: string;
  customerName: string;
  customerPhone: string;
  product: string;
  productId: string;
  quantitySold: number;
  sellingPrice: number;
  totalAmount: number;
  paymentMethod: "cash" | "upi" | "card" | "credit";
  oldStock: number;
  newStock: number;
  invoiceNo: string;
  saleDate: string;
  createdAt: string;
};

const emptySale = {
  customerName: "",
  customerPhone: "",
  productId: "",
  quantitySold: "",
  sellingPrice: "",
  paymentMethod: "cash",
  saleDate: "",
};

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [form, setForm] = useState(emptySale);
  const [message, setMessage] = useState("");
  const [stockMessage, setStockMessage] = useState("");
  const [invoiceMessage, setInvoiceMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  async function fetchProducts() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = await res.json();

    if (data.success) {
      setProducts(data.products);
    }
  }

  async function fetchSales() {
    try {
      setTableLoading(true);

      const res = await fetch("/api/sales", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setSales(data.sales);
      }
    } catch {
      setMessage("Failed to load sales");
    } finally {
      setTableLoading(false);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
      await fetchSales();
    };

    loadData();
  }, []);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product._id === form.productId);
  }, [products, form.productId]);

  const totalSalesAmount = useMemo(() => {
    return sales.reduce((total, item) => total + item.totalAmount, 0);
  }, [sales]);

  const totalItemsSold = useMemo(() => {
    return sales.reduce((total, item) => total + item.quantitySold, 0);
  }, [sales]);

  function handleProductChange(productId: string) {
    const product = products.find((item) => item._id === productId);

    setForm({
      ...form,
      productId,
      sellingPrice: product ? String(product.sellingPrice) : "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setStockMessage("");
    setInvoiceMessage("");

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to add sale");
        return;
      }

      setMessage("Sale added successfully ✅");

      setStockMessage(
        `${data.stockUpdate.product}: Old Stock ${data.stockUpdate.oldStock} → Sold ${data.stockUpdate.sold} → New Stock ${data.stockUpdate.newStock}`
      );

      setInvoiceMessage(
        `Invoice ${data.invoice.invoiceNo} created | Total: ₹${data.invoice.totalAmount} | Payment: ${data.invoice.paymentMethod.toUpperCase()}`
      );

      setForm(emptySale);

      await fetchProducts();
      await fetchSales();
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Are you sure you want to delete this sale?");

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete sale");
        return;
      }

      setMessage("Sale deleted successfully ✅");
      fetchSales();
    } catch {
      setMessage("Delete failed");
    }
  }

  function paymentBadge(method: Sale["paymentMethod"]) {
    if (method === "cash") return "bg-green-100 text-green-700";
    if (method === "upi") return "bg-purple-100 text-purple-700";
    if (method === "card") return "bg-blue-100 text-blue-700";
    return "bg-orange-100 text-orange-700";
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Sales</h1>
        <p className="mt-1 text-slate-500">
          Sell products, reduce stock automatically, save invoice details, and
          print invoices.
        </p>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Sales Entries</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {sales.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Sales Amount</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            ₹{totalSalesAmount}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Items Sold</p>
          <h2 className="mt-2 text-3xl font-bold text-orange-600">
            {totalItemsSold} units
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-slate-900">
          New Sale Entry
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Customer Name *
            </label>
            <input
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
              placeholder="Walk-in Customer"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Customer Phone
            </label>
            <input
              value={form.customerPhone}
              onChange={(e) =>
                setForm({ ...form, customerPhone: e.target.value })
              }
              placeholder="+91 98765 43210"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
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
              Quantity Sold *
            </label>
            <input
              type="number"
              value={form.quantitySold}
              onChange={(e) =>
                setForm({ ...form, quantitySold: e.target.value })
              }
              placeholder="2"
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
              Payment Method
            </label>
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({ ...form, paymentMethod: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Sale Date
            </label>
            <input
              type="date"
              value={form.saleDate}
              onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving Sale..." : "Save Sale & Update Stock"}
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

        {invoiceMessage && (
          <div className="mt-3 rounded-2xl bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700">
            {invoiceMessage}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">Sales History</h2>
          <p className="text-sm text-slate-500">
            Every sale entry is saved here with invoice and stock update details.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1250px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Qty Sold</th>
                <th className="px-4 py-3 font-medium">Selling Price</th>
                <th className="px-4 py-3 font-medium">Total Amount</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Stock Updated</th>
                <th className="px-4 py-3 font-medium">Sale Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tableLoading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading sales...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No sales found.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id} className="border-t border-slate-100">
                    <td className="px-4 py-4 font-bold text-blue-600">
                      {sale.invoiceNo}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">
                        {sale.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {sale.customerPhone || "No phone"}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900">
                      {sale.product}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {sale.quantitySold}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      ₹{sale.sellingPrice}
                    </td>

                    <td className="px-4 py-4 font-bold text-green-600">
                      ₹{sale.totalAmount}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${paymentBadge(
                          sale.paymentMethod
                        )}`}
                      >
                        {sale.paymentMethod.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                        {sale.oldStock} → -{sale.quantitySold} →{" "}
                        {sale.newStock}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/invoice/${sale._id}`}
                          className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100"
                        >
                          Invoice
                        </Link>

                        <button
                          onClick={() => handleDelete(sale._id)}
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