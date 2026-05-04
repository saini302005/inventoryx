import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const sales = await Sale.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: sales.length,
        sales,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get sales error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get sales",
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

    const customerName = String(body.customerName || "").trim();
    const customerPhone = String(body.customerPhone || "").trim();
    const productId = String(body.productId || "").trim();
    const quantitySold = Number(body.quantitySold);
    const sellingPrice = Number(body.sellingPrice);
    const paymentMethod = String(body.paymentMethod || "cash").trim();

    if (!customerName || !productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer name and product are required",
        },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(quantitySold) ||
      quantitySold <= 0 ||
      Number.isNaN(sellingPrice) ||
      sellingPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity and selling price must be valid numbers",
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

    if (product.quantity < quantitySold) {
      return NextResponse.json(
        {
          success: false,
          message: `Not enough stock. Available stock is ${product.quantity} ${product.unit}`,
        },
        { status: 400 }
      );
    }

    const oldStock = product.quantity;
    const newStock = oldStock - quantitySold;
    const totalAmount = quantitySold * sellingPrice;

    product.quantity = newStock;

    if (product.quantity <= 0) {
      product.status = "out-of-stock";
    } else if (product.quantity <= product.minStock) {
      product.status = "low-stock";
    } else {
      product.status = "in-stock";
    }

    await product.save();

    const invoiceNo = `INV-${Date.now()}`;

    const sale = await Sale.create({
      customerName,
      customerPhone,
      product: product.name,
      productId: product._id.toString(),
      quantitySold,
      sellingPrice,
      totalAmount,
      paymentMethod,
      oldStock,
      newStock,
      invoiceNo,
      saleDate: body.saleDate ? new Date(body.saleDate) : new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Sale added and product stock updated successfully",
        sale,
        stockUpdate: {
          product: product.name,
          oldStock,
          sold: quantitySold,
          newStock,
        },
        invoice: {
          invoiceNo,
          customerName,
          product: product.name,
          quantitySold,
          sellingPrice,
          totalAmount,
          paymentMethod,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create sale error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add sale",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}