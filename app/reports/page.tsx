"use client";

import AppLayout from "@/components/AppLayout";
import { useEffect, useMemo, useState } from "react";

type Sale = {
  _id: string;
  customerName: string;
  customerPhone: string;
  product: string;
  quantitySold: number;
  sellingPrice: number;
  totalAmount: number;
  paymentMethod: "cash" | "upi" | "card" | "credit";
  invoiceNo: string;
  saleDate: string;
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
};

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
};

type ExpiryProduct = Product & {
  expiryDate: string;
  daysLeft: number;
  expiryStatus: "expired" | "critical" | "expiring-soon" | "safe";
};

type ReportSummary = {
  totalSalesEntries: number;
  totalPurchaseEntries: number;
  totalSalesAmount: number;
  totalPurchaseAmount: number;
  totalProfit: number;
  totalProducts: number;
  inStockProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  stockValue: number;
  expiredCount: number;
  criticalExpiryCount: number;
  expiringSoonCount: number;
  totalExpiryAlerts: number;
};

type ReportsData = {
  summary: ReportSummary;
  sales: Sale[];
  purchases: Purchase[];
  products: Product[];
  lowStockProducts: Product[];
  expiryProducts: ExpiryProduct[];
};

const defaultData: ReportsData = {
  summary: {
    totalSalesEntries: 0,
    totalPurchaseEntries: 0,
    totalSalesAmount: 0,
    totalPurchaseAmount: 0,
    totalProfit: 0,
    totalProducts: 0,
    inStockProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    stockValue: 0,
    expiredCount: 0,
    criticalExpiryCount: 0,
    expiringSoonCount: 0,
    totalExpiryAlerts: 0,
  },
  sales: [],
  purchases: [],
  products: [],
  lowStockProducts: [],
  expiryProducts: [],
};

type ReportTab =
  | "sales"
  | "purchases"
  | "stock"
  | "low-stock"
  | "expiry"
  | "profit";

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

function downloadCSV(filename: string, rows: Record<string, string | number>[]) {
  if (rows.length === 0) {
    alert("No data available to export");
    return;
  }

  const headers = Object.keys(rows[0]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const cell = String(row[header] ?? "");
          return `"${cell.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData>(defaultData);
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchReports() {
    try {
      setLoading(true);
      setMessage("");

      const query =
        startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";

      const res = await fetch(`/api/reports${query}`, {
        cache: "no-store",
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.message || "Failed to load reports");
        return;
      }

      setData({
        summary: result.summary || defaultData.summary,
        sales: result.sales || [],
        purchases: result.purchases || [],
        products: result.products || [],
        lowStockProducts: result.lowStockProducts || [],
        expiryProducts: result.expiryProducts || [],
      });
    } catch {
      setMessage("Something went wrong while loading reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setMessage("");

        const query =
          startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";

        const res = await fetch(`/api/reports${query}`, {
          cache: "no-store",
        });

        const result = await res.json();

        if (!res.ok) {
          setMessage(result.message || "Failed to load reports");
          return;
        }

        setData({
          summary: result.summary || defaultData.summary,
          sales: result.sales || [],
          purchases: result.purchases || [],
          products: result.products || [],
          lowStockProducts: result.lowStockProducts || [],
          expiryProducts: result.expiryProducts || [],
        });
      } catch {
        setMessage("Something went wrong while loading reports");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [startDate, endDate]);

  const profitStatus = useMemo(() => {
    if (data.summary.totalProfit >= 0) return "Profit";
    return "Loss";
  }, [data.summary.totalProfit]);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();

    if ((startDate && !endDate) || (!startDate && endDate)) {
      setMessage("Please select both start date and end date");
      return;
    }

    fetchReports();
  }

  function resetFilter() {
    setStartDate("");
    setEndDate("");

    setTimeout(() => {
      fetchReports();
    }, 100);
  }

  function exportActiveReport() {
    if (activeTab === "sales") {
      downloadCSV(
        "sales-report.csv",
        data.sales.map((sale) => ({
          Invoice: sale.invoiceNo,
          Customer: sale.customerName,
          Phone: sale.customerPhone || "",
          Product: sale.product,
          Quantity: sale.quantitySold,
          SellingPrice: sale.sellingPrice,
          TotalAmount: sale.totalAmount,
          PaymentMethod: sale.paymentMethod,
          SaleDate: formatDate(sale.saleDate),
        }))
      );
    }

    if (activeTab === "purchases") {
      downloadCSV(
        "purchase-report.csv",
        data.purchases.map((purchase) => ({
          Supplier: purchase.supplier,
          Product: purchase.product,
          QuantityPurchased: purchase.quantityPurchased,
          PurchasePrice: purchase.purchasePrice,
          TotalAmount: purchase.totalAmount,
          OldStock: purchase.oldStock,
          NewStock: purchase.newStock,
          PurchaseDate: formatDate(purchase.purchaseDate),
        }))
      );
    }

    if (activeTab === "stock") {
      downloadCSV(
        "stock-report.csv",
        data.products.map((product) => ({
          Product: product.name,
          Category: product.category,
          Brand: product.brand || "",
          PurchasePrice: product.purchasePrice,
          SellingPrice: product.sellingPrice,
          Quantity: product.quantity,
          MinStock: product.minStock,
          Unit: product.unit,
          Supplier: product.supplier || "",
          Status: product.status,
          Barcode: product.barcode || "",
          StockValue: product.quantity * product.purchasePrice,
        }))
      );
    }

    if (activeTab === "low-stock") {
      downloadCSV(
        "low-stock-report.csv",
        data.lowStockProducts.map((product) => ({
          Product: product.name,
          Category: product.category,
          Quantity: product.quantity,
          MinStock: product.minStock,
          Unit: product.unit,
          Status: product.status,
          Supplier: product.supplier || "",
        }))
      );
    }

    if (activeTab === "expiry") {
      downloadCSV(
        "expiry-report.csv",
        data.expiryProducts.map((product) => ({
          Product: product.name,
          Category: product.category,
          Brand: product.brand || "",
          Quantity: product.quantity,
          Unit: product.unit,
          Supplier: product.supplier || "",
          ExpiryDate: formatDate(product.expiryDate),
          DaysLeft: product.daysLeft,
          ExpiryStatus: product.expiryStatus,
        }))
      );
    }

    if (activeTab === "profit") {
      downloadCSV("profit-report.csv", [
        {
          TotalSalesAmount: data.summary.totalSalesAmount,
          TotalPurchaseAmount: data.summary.totalPurchaseAmount,
          ProfitOrLoss: data.summary.totalProfit,
          Status: profitStatus,
          StockValue: data.summary.stockValue,
          TotalProducts: data.summary.totalProducts,
          LowStockCount: data.summary.lowStockCount,
          OutOfStockCount: data.summary.outOfStockCount,
          ExpiryAlerts: data.summary.totalExpiryAlerts,
        },
      ]);
    }
  }

  const tabs: { id: ReportTab; label: string }[] = [
    { id: "sales", label: "Sales Report" },
    { id: "purchases", label: "Purchase Report" },
    { id: "stock", label: "Stock Report" },
    { id: "low-stock", label: "Low Stock Report" },
    { id: "expiry", label: "Expiry Report" },
    { id: "profit", label: "Profit Report" },
  ];

  return (
    <AppLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="mt-1 text-slate-500">
            Analyze sales, purchases, stock, low stock, expiry and profit.
          </p>
        </div>

        <button
          onClick={exportActiveReport}
          className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
        >
          Export Active Report CSV
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      )}

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form
          onSubmit={handleFilter}
          className="grid grid-cols-1 gap-4 md:grid-cols-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Apply Filter
            </button>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilter}
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Reset Filter
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading reports...
        </div>
      ) : (
        <>
          <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Sales Amount</p>
              <h2 className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(data.summary.totalSalesAmount)}
              </h2>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Purchase Amount</p>
              <h2 className="mt-2 text-2xl font-bold text-blue-600">
                {formatCurrency(data.summary.totalPurchaseAmount)}
              </h2>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{profitStatus}</p>
              <h2
                className={`mt-2 text-2xl font-bold ${
                  data.summary.totalProfit >= 0
                    ? "text-purple-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(data.summary.totalProfit)}
              </h2>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Expiry Alerts</p>
              <h2 className="mt-2 text-2xl font-bold text-yellow-600">
                {data.summary.totalExpiryAlerts}
              </h2>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Low / Out Stock</p>
              <h2 className="mt-2 text-2xl font-bold text-red-600">
                {data.summary.lowStockCount + data.summary.outOfStockCount}
              </h2>
            </div>
          </section>

          <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {activeTab === "sales" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-slate-900">
                Sales Report
              </h2>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[1000px] border-collapse text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Invoice</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Qty</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Payment</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.sales.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          No sales data found.
                        </td>
                      </tr>
                    ) : (
                      data.sales.map((sale) => (
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

                          <td className="px-4 py-4 font-medium text-slate-900">
                            {sale.product}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {sale.quantitySold}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {formatCurrency(sale.sellingPrice)}
                          </td>

                          <td className="px-4 py-4 font-bold text-green-600">
                            {formatCurrency(sale.totalAmount)}
                          </td>

                          <td className="px-4 py-4 uppercase text-slate-700">
                            {sale.paymentMethod}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {formatDate(sale.saleDate)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "purchases" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-slate-900">
                Purchase Report
              </h2>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[1000px] border-collapse text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Supplier</th>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Qty</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Stock</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.purchases.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          No purchase data found.
                        </td>
                      </tr>
                    ) : (
                      data.purchases.map((purchase) => (
                        <tr
                          key={purchase._id}
                          className="border-t border-slate-100"
                        >
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
                            {formatCurrency(purchase.purchasePrice)}
                          </td>

                          <td className="px-4 py-4 font-bold text-green-600">
                            {formatCurrency(purchase.totalAmount)}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {purchase.oldStock} → {purchase.newStock}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {formatDate(purchase.purchaseDate)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "stock" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-slate-900">
                Stock Report
              </h2>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[1100px] border-collapse text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Brand</th>
                      <th className="px-4 py-3 font-medium">Purchase</th>
                      <th className="px-4 py-3 font-medium">Selling</th>
                      <th className="px-4 py-3 font-medium">Qty</th>
                      <th className="px-4 py-3 font-medium">Min Stock</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Stock Value</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.products.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          No stock data found.
                        </td>
                      </tr>
                    ) : (
                      data.products.map((product) => (
                        <tr
                          key={product._id}
                          className="border-t border-slate-100"
                        >
                          <td className="px-4 py-4 font-bold text-slate-900">
                            {product.name}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {product.category}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {product.brand || "-"}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {formatCurrency(product.purchasePrice)}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {formatCurrency(product.sellingPrice)}
                          </td>

                          <td className="px-4 py-4 font-bold text-slate-900">
                            {product.quantity} {product.unit}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {product.minStock}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                product.status === "in-stock"
                                  ? "bg-green-100 text-green-700"
                                  : product.status === "low-stock"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.status}
                            </span>
                          </td>

                          <td className="px-4 py-4 font-bold text-green-600">
                            {formatCurrency(
                              product.quantity * product.purchasePrice
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "low-stock" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-slate-900">
                Low Stock Report
              </h2>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[800px] border-collapse text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Current Qty</th>
                      <th className="px-4 py-3 font-medium">Min Stock</th>
                      <th className="px-4 py-3 font-medium">Supplier</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.lowStockProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center font-semibold text-green-600"
                        >
                          Great! No low stock products found.
                        </td>
                      </tr>
                    ) : (
                      data.lowStockProducts.map((product) => (
                        <tr
                          key={product._id}
                          className="border-t border-slate-100"
                        >
                          <td className="px-4 py-4 font-bold text-slate-900">
                            {product.name}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {product.category}
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
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                              {product.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "expiry" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-slate-900">
                Expiry Report
              </h2>

              <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="rounded-3xl bg-red-50 p-5">
                  <p className="text-sm font-semibold text-red-700">Expired</p>
                  <h3 className="mt-2 text-3xl font-bold text-red-700">
                    {data.summary.expiredCount}
                  </h3>
                </div>

                <div className="rounded-3xl bg-orange-50 p-5">
                  <p className="text-sm font-semibold text-orange-700">
                    Critical 0-7 Days
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-orange-700">
                    {data.summary.criticalExpiryCount}
                  </h3>
                </div>

                <div className="rounded-3xl bg-yellow-50 p-5">
                  <p className="text-sm font-semibold text-yellow-700">
                    Expiring Soon 8-30 Days
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-yellow-700">
                    {data.summary.expiringSoonCount}
                  </h3>
                </div>
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
                      <th className="px-4 py-3 font-medium">Days Left</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.expiryProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center font-semibold text-green-600"
                        >
                          No expiry alert products found.
                        </td>
                      </tr>
                    ) : (
                      data.expiryProducts.map((product) => (
                        <tr
                          key={product._id}
                          className="border-t border-slate-100"
                        >
                          <td className="px-4 py-4 font-bold text-slate-900">
                            {product.name}
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

                          <td className="px-4 py-4 text-slate-700">
                            {formatDate(product.expiryDate)}
                          </td>

                          <td
                            className={`px-4 py-4 font-bold ${
                              product.daysLeft < 0
                                ? "text-red-600"
                                : product.daysLeft <= 7
                                ? "text-orange-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {product.daysLeft < 0
                              ? `${Math.abs(product.daysLeft)} days ago`
                              : `${product.daysLeft} days left`}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                product.expiryStatus === "expired"
                                  ? "bg-red-100 text-red-700"
                                  : product.expiryStatus === "critical"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {product.expiryStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "profit" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-slate-900">
                Profit Report
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-3xl bg-green-50 p-6">
                  <p className="text-sm font-semibold text-green-700">
                    Total Sales Amount
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-green-700">
                    {formatCurrency(data.summary.totalSalesAmount)}
                  </h2>
                </div>

                <div className="rounded-3xl bg-blue-50 p-6">
                  <p className="text-sm font-semibold text-blue-700">
                    Total Purchase Amount
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-blue-700">
                    {formatCurrency(data.summary.totalPurchaseAmount)}
                  </h2>
                </div>

                <div
                  className={`rounded-3xl p-6 ${
                    data.summary.totalProfit >= 0 ? "bg-purple-50" : "bg-red-50"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      data.summary.totalProfit >= 0
                        ? "text-purple-700"
                        : "text-red-700"
                    }`}
                  >
                    Net {profitStatus}
                  </p>
                  <h2
                    className={`mt-2 text-3xl font-bold ${
                      data.summary.totalProfit >= 0
                        ? "text-purple-700"
                        : "text-red-700"
                    }`}
                  >
                    {formatCurrency(data.summary.totalProfit)}
                  </h2>
                </div>

                <div className="rounded-3xl bg-orange-50 p-6">
                  <p className="text-sm font-semibold text-orange-700">
                    Current Stock Value
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-orange-700">
                    {formatCurrency(data.summary.stockValue)}
                  </h2>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Formula Used
                </h3>
                <p className="mt-2 text-slate-600">
                  Net Profit = Total Sales Amount - Total Purchase Amount
                </p>
                <p className="mt-1 text-slate-600">
                  Stock Value = Current Quantity × Purchase Price
                </p>
              </div>
            </section>
          )}
        </>
      )}
    </AppLayout>
  );
}