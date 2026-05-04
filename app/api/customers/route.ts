import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";

export async function GET() {
  try {
    await connectDB();

    const sales = await Sale.find({}).sort({ createdAt: -1 });

    const customerMap = new Map();

    sales.forEach((sale) => {
      const key = `${sale.customerName}-${sale.customerPhone || "no-phone"}`;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          customerName: sale.customerName,
          customerPhone: sale.customerPhone || "",
          totalOrders: 0,
          totalSpent: 0,
          lastPurchaseDate: sale.saleDate,
          products: new Set(),
        });
      }

      const customer = customerMap.get(key);
      customer.totalOrders += 1;
      customer.totalSpent += Number(sale.totalAmount || 0);
      customer.products.add(sale.product);

      if (new Date(sale.saleDate) > new Date(customer.lastPurchaseDate)) {
        customer.lastPurchaseDate = sale.saleDate;
      }
    });

    const customers = Array.from(customerMap.values()).map((customer) => ({
      ...customer,
      products: Array.from(customer.products),
    }));

    return NextResponse.json(
      {
        success: true,
        count: customers.length,
        customers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Customers API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load customers",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}