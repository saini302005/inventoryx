"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: "🏠" },
  { name: "Products", href: "/products", icon: "📦" },
  { name: "Categories", href: "/categories", icon: "🔲" },
  { name: "Suppliers", href: "/suppliers", icon: "🚚" },
  { name: "Purchases", href: "/purchases", icon: "🛒" },
  { name: "Sales", href: "/sales", icon: "📊" },
  { name: "Low Stock", href: "/low-stock", icon: "⚠️" },
  { name: "Expiry", href: "/expiry", icon: "⏰" },
  { name: "Reports", href: "/reports", icon: "📄" },
  { name: "Customers", href: "/customers", icon: "👥" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-slate-950 text-white">
      <div className="flex h-full flex-col px-5 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-lg shadow-blue-900/40">
              📦
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Inventory<span className="text-blue-400">X</span>
              </h1>
              <p className="text-xs text-slate-400">
                Smart Inventory Management
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 rounded-3xl border border-blue-900/50 bg-slate-900 p-5">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl">
            👑
          </div>

          <h3 className="font-semibold">Go Premium</h3>

          <p className="mt-1 text-sm text-slate-400">
            Unlock advanced reports and multi-warehouse features.
          </p>

          <button className="mt-4 w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}