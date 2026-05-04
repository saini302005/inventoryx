import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const categories = await Category.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: categories.length,
        categories,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get categories",
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
    const description = String(body.description || "").trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required",
        },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category already exists",
        },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name,
      description,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category added successfully",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add category",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}