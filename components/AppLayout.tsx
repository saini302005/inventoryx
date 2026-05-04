import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-72 min-h-screen">
        <Navbar />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}