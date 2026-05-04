import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
            { supplier: { $regex: search, $options: "i" } },
            { barcode: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get products",
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

    const name = String(body.name || "").trim();
    const category = String(body.category || "").trim();
    const brand = String(body.brand || "").trim();
    const supplier = String(body.supplier || "").trim();
    const unit = String(body.unit || "pcs").trim();
    const barcode = String(body.barcode || "").trim();

    const purchasePrice = Number(body.purchasePrice);
    const sellingPrice = Number(body.sellingPrice);
    const quantity = Number(body.quantity);
    const minStock = Number(body.minStock || 10);

    if (!name || !category) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name and category are required",
        },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(purchasePrice) ||
      Number.isNaN(sellingPrice) ||
      Number.isNaN(quantity)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Purchase price, selling price and quantity must be numbers",
        },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      category,
      brand,
      purchasePrice,
      sellingPrice,
      quantity,
      minStock: Number.isNaN(minStock) ? 10 : minStock,
      unit,
      supplier,
      barcode,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product added successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}