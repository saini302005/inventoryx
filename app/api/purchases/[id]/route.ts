import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/models/Purchase";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

    const purchase = await Purchase.findByIdAndDelete(id);

    if (!purchase) {
      return NextResponse.json(
        {
          success: false,
          message: "Purchase not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Purchase deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete purchase error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete purchase",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}