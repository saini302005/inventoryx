import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Supplier from "@/models/Supplier";
import Purchase from "@/models/Purchase";
import Sale from "@/models/Sale";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json(
        {
          success: true,
          query: q,
          total: 0,
          results: [],
        },
        { status: 200 }
      );
    }

    const regex = { $regex: q, $options: "i" };

    const [products, categories, suppliers, purchases, sales] =
      await Promise.all([
        Product.find({
          $or: [
            { name: regex },
            { category: regex },
            { brand: regex },
            { supplier: regex },
            { barcode: regex },
            { status: regex },
          ],
        }).limit(8),

        Category.find({
          $or: [{ name: regex }, { description: regex }],
        }).limit(8),

        Supplier.find({
          $or: [
            { name: regex },
            { companyName: regex },
            { phone: regex },
            { email: regex },
            { address: regex },
            { status: regex },
          ],
        }).limit(8),

        Purchase.find({
          $or: [{ supplier: regex }, { product: regex }],
        }).limit(8),

        Sale.find({
          $or: [
            { customerName: regex },
            { customerPhone: regex },
            { product: regex },
            { invoiceNo: regex },
            { paymentMethod: regex },
          ],
        }).limit(8),
      ]);

    const results = [
      ...products.map((item) => ({
        id: item._id.toString(),
        type: "Product",
        title: item.name,
        subtitle: `${item.category} | Stock: ${item.quantity} ${item.unit}`,
        meta: item.status,
        href: "/products",
      })),

      ...categories.map((item) => ({
        id: item._id.toString(),
        type: "Category",
        title: item.name,
        subtitle: item.description || "No description",
        meta: "Category",
        href: "/categories",
      })),

      ...suppliers.map((item) => ({
        id: item._id.toString(),
        type: "Supplier",
        title: item.companyName,
        subtitle: `${item.name} | ${item.phone}`,
        meta: item.status,
        href: "/suppliers",
      })),

      ...purchases.map((item) => ({
        id: item._id.toString(),
        type: "Purchase",
        title: item.product,
        subtitle: `${item.supplier} | Qty: ${item.quantityPurchased}`,
        meta: `₹${item.totalAmount}`,
        href: "/purchases",
      })),

      ...sales.map((item) => ({
        id: item._id.toString(),
        type: "Sale",
        title: item.invoiceNo,
        subtitle: `${item.customerName} | ${item.product}`,
        meta: `₹${item.totalAmount}`,
        href: "/sales",
      })),
    ];

    return NextResponse.json(
      {
        success: true,
        query: q,
        total: results.length,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}