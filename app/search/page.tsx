"use client";

import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type SearchResult = {
  id: string;
  type: "Product" | "Category" | "Supplier" | "Purchase" | "Sale";
  title: string;
  subtitle: string;
  meta: string;
  href: string;
};

function typeBadge(type: SearchResult["type"]) {
  if (type === "Product") return "bg-blue-100 text-blue-700";
  if (type === "Category") return "bg-purple-100 text-purple-700";
  if (type === "Supplier") return "bg-green-100 text-green-700";
  if (type === "Purchase") return "bg-orange-100 text-orange-700";
  return "bg-cyan-100 text-cyan-700";
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!q) return;

    const performSearch = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Search failed");
          return;
        }

        setResults(data.results || []);
      } catch {
        setMessage("Something went wrong while searching");
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [q]);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Global Search</h1>
        <p className="mt-1 text-slate-500">
          Search results for:{" "}
          <span className="font-bold text-blue-600">{q || "No query"}</span>
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Search Results
            </h2>
            <p className="text-sm text-slate-500">
              Found {results.length} result(s)
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-10 text-center text-slate-500">
            Searching...
          </div>
        ) : !q ? (
          <div className="rounded-2xl bg-slate-50 p-10 text-center text-slate-500">
            Please type something in the navbar search box.
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-10 text-center text-slate-500">
            No results found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {results.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="rounded-3xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${typeBadge(
                        item.type
                      )}`}
                    >
                      {item.type}
                    </span>

                    <h3 className="mt-3 text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                      {item.meta}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-blue-600">
                      Open →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading search page...
          </div>
        </AppLayout>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}