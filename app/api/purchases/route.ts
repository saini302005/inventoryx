import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/models/Purchase";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const purchases = await Purchase.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: purchases.length,
        purchases,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get purchases error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get purchases",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const supplier = String(body.supplier || "").trim();
    const productId = String(body.productId || "").trim();
    const quantityPurchased = Number(body.quantityPurchased);
    const purchasePrice = Number(body.purchasePrice);

    if (!supplier || !productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier and product are required",
        },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(quantityPurchased) ||
      quantityPurchased <= 0 ||
      Number.isNaN(purchasePrice) ||
      purchasePrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity and purchase price must be valid numbers",
        },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const oldStock = product.quantity;
    const newStock = oldStock + quantityPurchased;
    const totalAmount = quantityPurchased * purchasePrice;

    product.quantity = newStock;

    if (product.quantity <= 0) {
      product.status = "out-of-stock";
    } else if (product.quantity <= product.minStock) {
      product.status = "low-stock";
    } else {
      product.status = "in-stock";
    }

    await product.save();

    const purchase = await Purchase.create({
      supplier,
      product: product.name,
      quantityPurchased,
      purchasePrice,
      totalAmount,
      oldStock,
      newStock,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Purchase added and product stock updated successfully",
        purchase,
        stockUpdate: {
          product: product.name,
          oldStock,
          purchased: quantityPurchased,
          newStock,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create purchase error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add purchase",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}