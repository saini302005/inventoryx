import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json(
      {
        success: true,
        app: "InventoryX",
        database: "connected",
        message: "MongoDB connection working",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        app: "InventoryX",
        database: "disconnected",
        message: "MongoDB connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}