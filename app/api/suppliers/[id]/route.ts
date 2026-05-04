import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Supplier from "@/models/Supplier";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        supplier,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get single supplier error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get supplier",
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

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const address = String(body.address || "").trim();
    const companyName = String(body.companyName || "").trim();
    const status = body.status === "inactive" ? "inactive" : "active";

    if (!name || !phone || !companyName) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier name, phone and company name are required",
        },
        { status: 400 }
      );
    }

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      {
        name,
        phone,
        email,
        address,
        companyName,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!supplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Supplier updated successfully",
        supplier,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update supplier error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update supplier",
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

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Supplier deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete supplier error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete supplier",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}