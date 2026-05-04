import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get single category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get category",
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
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Another category already exists with this name",
        },
        { status: 409 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        description,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully",
        category,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update category",
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

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete category",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}