import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Supplier from "@/models/Supplier";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { companyName: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: suppliers.length,
        suppliers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get suppliers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get suppliers",
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
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const address = String(body.address || "").trim();
    const companyName = String(body.companyName || "").trim();
    const status = body.status || "active";

    if (!name || !phone || !companyName) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier name, phone and company name are required",
        },
        { status: 400 }
      );
    }

    const supplier = await Supplier.create({
      name,
      phone,
      email,
      address,
      companyName,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Supplier added successfully",
        supplier,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create supplier error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add supplier",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}