const express = require("express");
const Order = require("../models/Order");
const protect = require("../middleware/auth");

const router = express.Router();


// ==========================================
// GET ALL ORDERS
// ==========================================

router.get("/", protect, async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ date: -1 })
      .limit(100)
      .lean();

    res.json(orders);
  } catch (error) {
    next(error);
  }
});


// ==========================================
// CREATE NEW ORDER
// ==========================================

router.post("/", protect, async (req, res, next) => {
  try {
    const {
      orderId,
      customer,
      product,
      category,
      amount,
      status,
      date
    } = req.body;

    if (
      !orderId ||
      !customer ||
      !product ||
      !category ||
      amount === undefined ||
      !date
    ) {
      return res.status(400).json({
        message: "Required order fields are missing."
      });
    }

    const order = await Order.create({
      orderId,
      customer,
      product,
      category,
      amount,
      status: status || "Completed",
      date
    });

    res.status(201).json(order);

  } catch (error) {
    next(error);
  }
});


// ==========================================
// UPDATE ORDER
// ==========================================

router.put("/:id", protect, async (req, res, next) => {
  try {
    const {
      customer,
      product,
      category,
      amount,
      status,
      date
    } = req.body;

    // Validate required fields
    if (
      !customer ||
      !product ||
      !category ||
      amount === undefined ||
      !date
    ) {
      return res.status(400).json({
        message: "Required order fields are missing."
      });
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        customer,
        product,
        category,
        amount,
        status,
        date
      },
      {
        new: true,
        runValidators: true
      }
    );

    // Order not found
    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found."
      });
    }

    res.json(updatedOrder);

  } catch (error) {
    next(error);
  }
});


// ==========================================
// DELETE ORDER
// ==========================================

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(
      req.params.id
    );

    if (!deletedOrder) {
      return res.status(404).json({
        message: "Order not found."
      });
    }

    res.json({
      message: "Order deleted successfully.",
      order: deletedOrder
    });

  } catch (error) {
    next(error);
  }
});


module.exports = router;