"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Sale = {
  _id: string;
  customerName: string;
  customerPhone: string;
  product: string;
  quantitySold: number;
  sellingPrice: number;
  totalAmount: number;
  paymentMethod: "cash" | "upi" | "card" | "credit";
  oldStock: number;
  newStock: number;
  invoiceNo: string;
  saleDate: string;
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

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSale = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const res = await fetch(`/api/sales/${id}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to load invoice");
          return;
        }

        setSale(data.sale);
      } catch {
        setMessage("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadSale();
  }, [id]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading invoice...</p>
      </main>
    );
  }

  if (!sale) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-red-600">{message}</p>
          <Link
            href="/sales"
            className="mt-5 inline-block rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
          >
            Back to Sales
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white">
      <div className="mx-auto mb-6 flex max-w-3xl justify-between print:hidden">
        <Link
          href="/sales"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm"
        >
          ← Back to Sales
        </Link>

        <button
          onClick={handlePrint}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
        >
          Print / Save PDF
        </button>
      </div>

      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-3xl text-white">
              📦
            </div>
            <h1 className="text-3xl font-bold text-slate-900">InventoryX Store</h1>
            <p className="mt-1 text-sm text-slate-500">
              Smart Inventory Management System
            </p>
            <p className="mt-1 text-sm text-slate-500">
              India | support@inventoryx.com
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Invoice
            </p>
            <h2 className="mt-2 text-2xl font-bold text-blue-600">
              {sale.invoiceNo}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Date: {formatDate(sale.saleDate)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Payment: {sale.paymentMethod.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 border-b border-slate-200 py-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Bill To
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">
              {sale.customerName}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Phone: {sale.customerPhone || "-"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Stock Update
            </p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              Old Stock: {sale.oldStock}
            </p>
            <p className="mt-1 text-sm font-bold text-red-600">
              Sold: {sale.quantitySold}
            </p>
            <p className="mt-1 text-sm font-bold text-green-600">
              New Stock: {sale.newStock}
            </p>
          </div>
        </div>

        <div className="py-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="px-4 py-4 font-bold text-slate-900">
                    {sale.product}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {sale.quantitySold}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {formatCurrency(sale.sellingPrice)}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900">
                    {formatCurrency(sale.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs rounded-2xl bg-slate-50 p-5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(sale.totalAmount)}</span>
              </div>

              <div className="mt-3 flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>₹0</span>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span>{formatCurrency(sale.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 text-center">
          <p className="font-bold text-slate-900">Thank you for your business!</p>
          <p className="mt-1 text-sm text-slate-500">
            This invoice was generated by InventoryX.
          </p>
        </div>
      </section>
    </main>
  );
}