import mongoose, { Schema, models } from "mongoose";

const SaleSchema = new Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },

    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    product: {
      type: String,
      required: [true, "Product is required"],
      trim: true,
    },

    productId: {
      type: String,
      required: [true, "Product ID is required"],
      trim: true,
    },

    quantitySold: {
      type: Number,
      required: [true, "Quantity sold is required"],
      min: 1,
    },

    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "credit"],
      default: "cash",
    },

    oldStock: {
      type: Number,
      default: 0,
    },

    newStock: {
      type: Number,
      default: 0,
    },

    invoiceNo: {
      type: String,
      required: true,
      trim: true,
    },

    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Sale = models.Sale || mongoose.model("Sale", SaleSchema);

export default Sale;