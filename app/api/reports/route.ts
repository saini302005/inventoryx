import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Purchase from "@/models/Purchase";
import Sale from "@/models/Sale";

function getDaysLeft(expiryDate: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter =
      startDate && endDate
        ? {
            $gte: new Date(`${startDate}T00:00:00.000Z`),
            $lte: new Date(`${endDate}T23:59:59.999Z`),
          }
        : undefined;

    const saleQuery = dateFilter ? { saleDate: dateFilter } : {};
    const purchaseQuery = dateFilter ? { purchaseDate: dateFilter } : {};

    const [sales, purchases, products, lowStockProducts] = await Promise.all([
      Sale.find(saleQuery).sort({ saleDate: -1 }),
      Purchase.find(purchaseQuery).sort({ purchaseDate: -1 }),
      Product.find({}).sort({ createdAt: -1 }),
      Product.find({
        $or: [{ status: "low-stock" }, { status: "out-of-stock" }],
      }).sort({ quantity: 1 }),
    ]);

    const expiryProducts = products
      .filter((product) => product.expiryDate)
      .map((product) => {
        const daysLeft = getDaysLeft(product.expiryDate);

        let expiryStatus = "safe";

        if (daysLeft < 0) {
          expiryStatus = "expired";
        } else if (daysLeft <= 7) {
          expiryStatus = "critical";
        } else if (daysLeft <= 30) {
          expiryStatus = "expiring-soon";
        }

        return {
          _id: product._id.toString(),
          name: product.name,
          category: product.category,
          brand: product.brand,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          quantity: product.quantity,
          minStock: product.minStock,
          unit: product.unit,
          supplier: product.supplier,
          barcode: product.barcode,
          expiryDate: product.expiryDate,
          daysLeft,
          expiryStatus,
        };
      })
      .filter((product) => product.expiryStatus !== "safe")
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const totalSalesAmount = sales.reduce(
      (total, sale) => total + Number(sale.totalAmount || 0),
      0
    );

    const totalPurchaseAmount = purchases.reduce(
      (total, purchase) => total + Number(purchase.totalAmount || 0),
      0
    );

    const totalProfit = totalSalesAmount - totalPurchaseAmount;

    const totalProducts = products.length;

    const inStockProducts = products.filter(
      (item) => item.status === "in-stock"
    ).length;

    const lowStockCount = products.filter(
      (item) => item.status === "low-stock"
    ).length;

    const outOfStockCount = products.filter(
      (item) => item.status === "out-of-stock"
    ).length;

    const stockValue = products.reduce((total, product) => {
      return (
        total +
        Number(product.quantity || 0) * Number(product.purchasePrice || 0)
      );
    }, 0);

    const expiredCount = expiryProducts.filter(
      (item) => item.expiryStatus === "expired"
    ).length;

    const criticalExpiryCount = expiryProducts.filter(
      (item) => item.expiryStatus === "critical"
    ).length;

    const expiringSoonCount = expiryProducts.filter(
      (item) => item.expiryStatus === "expiring-soon"
    ).length;

    return NextResponse.json(
      {
        success: true,

        filters: {
          startDate,
          endDate,
        },

        summary: {
          totalSalesEntries: sales.length,
          totalPurchaseEntries: purchases.length,
          totalSalesAmount,
          totalPurchaseAmount,
          totalProfit,
          totalProducts,
          inStockProducts,
          lowStockCount,
          outOfStockCount,
          stockValue,
          expiredCount,
          criticalExpiryCount,
          expiringSoonCount,
          totalExpiryAlerts:
            expiredCount + criticalExpiryCount + expiringSoonCount,
        },

        sales,
        purchases,
        products,
        lowStockProducts,
        expiryProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reports API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load reports",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}