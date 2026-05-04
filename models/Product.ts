import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: 0,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 0,
      default: 0,
    },

    minStock: {
      type: Number,
      min: 0,
      default: 10,
    },

    unit: {
      type: String,
      default: "pcs",
      trim: true,
    },

    supplier: {
      type: String,
      default: "",
      trim: true,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    barcode: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["in-stock", "low-stock", "out-of-stock"],
      default: "in-stock",
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.pre("validate", function () {
  if (this.quantity <= 0) {
    this.status = "out-of-stock";
  } else if (this.quantity <= this.minStock) {
    this.status = "low-stock";
  } else {
    this.status = "in-stock";
  }
});

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;