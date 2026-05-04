import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Supplier from "@/models/Supplier";
import Purchase from "@/models/Purchase";
import Sale from "@/models/Sale";

export async function GET() {
  try {
    await connectDB();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    next30Days.setHours(23, 59, 59, 999);

    const [
      totalProducts,
      totalCategories,
      totalSuppliers,
      inStockProducts,
      lowStockProducts,
      outOfStockProducts,
      lowStockList,
      recentSales,
      recentPurchases,
      allSales,
      allPurchases,
      todaySales,
      expiringSoonCount,
      expiringSoonList,
    ] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Supplier.countDocuments(),

      Product.countDocuments({ status: "in-stock" }),
      Product.countDocuments({ status: "low-stock" }),
      Product.countDocuments({ status: "out-of-stock" }),

      Product.find({
        $or: [{ status: "low-stock" }, { status: "out-of-stock" }],
      })
        .sort({ quantity: 1 })
        .limit(5),

      Sale.find({}).sort({ createdAt: -1 }).limit(5),
      Purchase.find({}).sort({ createdAt: -1 }).limit(5),

      Sale.find({}),
      Purchase.find({}),

      Sale.find({
        saleDate: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      }),

      Product.countDocuments({
        expiryDate: {
          $ne: null,
          $lte: next30Days,
        },
      }),

      Product.find({
        expiryDate: {
          $ne: null,
          $lte: next30Days,
        },
      })
        .sort({ expiryDate: 1 })
        .limit(5),
    ]);

    const totalRevenue = allSales.reduce(
      (total, sale) => total + Number(sale.totalAmount || 0),
      0
    );

    const todaySalesAmount = todaySales.reduce(
      (total, sale) => total + Number(sale.totalAmount || 0),
      0
    );

    const totalPurchaseAmount = allPurchases.reduce(
      (total, purchase) => total + Number(purchase.totalAmount || 0),
      0
    );

    const recentTransactions = [
      ...recentSales.map((sale) => ({
        id: sale._id.toString(),
        date: sale.saleDate,
        type: "Sale",
        ref: sale.invoiceNo,
        party: sale.customerName,
        product: sale.product,
        amount: sale.totalAmount,
        status: "Completed",
        createdAt: sale.createdAt,
      })),

      ...recentPurchases.map((purchase) => ({
        id: purchase._id.toString(),
        date: purchase.purchaseDate,
        type: "Purchase",
        ref: `PUR-${purchase._id.toString().slice(-6).toUpperCase()}`,
        party: purchase.supplier,
        product: purchase.product,
        amount: purchase.totalAmount,
        status: "Completed",
        createdAt: purchase.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 6);

    return NextResponse.json(
      {
        success: true,

        stats: {
          totalProducts,
          totalCategories,
          totalSuppliers,
          inStockProducts,
          lowStockProducts,
          outOfStockProducts,
          todaySalesAmount,
          totalRevenue,
          totalPurchaseAmount,
          expiringSoonCount,
        },

        recentTransactions,
        lowStockList,
        expiringSoonList,

        stockDistribution: {
          inStock: inStockProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}