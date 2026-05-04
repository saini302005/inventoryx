import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get single product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const updatedData = {
      ...body,
      purchasePrice: Number(body.purchasePrice),
      sellingPrice: Number(body.sellingPrice),
      quantity: Number(body.quantity),
      minStock: Number(body.minStock),
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
    };

    if (updatedData.quantity <= 0) {
      updatedData.status = "out-of-stock";
    } else if (updatedData.quantity <= updatedData.minStock) {
      updatedData.status = "low-stock";
    } else {
      updatedData.status = "in-stock";
    }

    const product = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}