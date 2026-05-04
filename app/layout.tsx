import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InventoryX - Smart Inventory Management System",
  description: "Modern inventory management system for shops and businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}