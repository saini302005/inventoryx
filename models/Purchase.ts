import mongoose, { Schema, models } from "mongoose";

const PurchaseSchema = new Schema(
  {
    supplier: {
      type: String,
      required: [true, "Supplier is required"],
      trim: true,
    },

    product: {
      type: String,
      required: [true, "Product is required"],
      trim: true,
    },

    quantityPurchased: {
      type: Number,
      required: [true, "Quantity purchased is required"],
      min: 1,
    },

    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    oldStock: {
      type: Number,
      default: 0,
    },

    newStock: {
      type: Number,
      default: 0,
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Purchase =
  models.Purchase || mongoose.model("Purchase", PurchaseSchema);

export default Purchase;