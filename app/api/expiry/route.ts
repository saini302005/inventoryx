import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

function getDaysLeft(expiryDate: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({
      expiryDate: { $ne: null },
    }).sort({ expiryDate: 1 });

    const expiryProducts = products
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
          quantity: product.quantity,
          unit: product.unit,
          supplier: product.supplier,
          expiryDate: product.expiryDate,
          barcode: product.barcode,
          daysLeft,
          expiryStatus,
        };
      })
      .filter((product) => product.expiryStatus !== "safe");

    const expired = expiryProducts.filter(
      (product) => product.expiryStatus === "expired"
    );

    const critical = expiryProducts.filter(
      (product) => product.expiryStatus === "critical"
    );

    const expiringSoon = expiryProducts.filter(
      (product) => product.expiryStatus === "expiring-soon"
    );

    return NextResponse.json(
      {
        success: true,
        count: expiryProducts.length,
        summary: {
          expired: expired.length,
          critical: critical.length,
          expiringSoon: expiringSoon.length,
        },
        products: expiryProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Expiry API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load expiry data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}