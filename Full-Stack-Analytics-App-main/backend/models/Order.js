const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },

    customer: {
      type: String,
      required: true,
      trim: true
    },

    product: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: [
        "Technology",
        "Fashion",
        "Home",
        "Beauty",
        "Sports"
      ],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "Completed",
        "Pending",
        "Cancelled",
        "Refunded"
      ],
      default: "Completed"
    },

    date: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", orderSchema);