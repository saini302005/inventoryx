import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

    const sale = await Sale.findById(id);

    if (!sale) {
      return NextResponse.json(
        {
          success: false,
          message: "Sale not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        sale,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get single sale error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get sale",
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

    const sale = await Sale.findByIdAndDelete(id);

    if (!sale) {
      return NextResponse.json(
        {
          success: false,
          message: "Sale not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Sale deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete sale error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete sale",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}