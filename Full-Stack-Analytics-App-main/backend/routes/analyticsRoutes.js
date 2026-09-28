const express = require("express");
const Order = require("../models/Order");
const protect = require("../middleware/auth");

const router = express.Router();

function buildMatch(query) {
  const match = {};

  if (query.category && query.category !== "All") {
    match.category = query.category;
  }

  if (query.status && query.status !== "All") {
    match.status = query.status;
  }

  if (query.from || query.to) {
    match.date = {};

    if (query.from) {
      match.date.$gte = new Date(`${query.from}T00:00:00.000Z`);
    }

    if (query.to) {
      match.date.$lte = new Date(`${query.to}T23:59:59.999Z`);
    }
  }

  return match;
}


// ===============================
// DASHBOARD
// ===============================

router.get("/dashboard", protect, async (req, res, next) => {
  try {
    const match = buildMatch(req.query);

    const [
      summary,
      revenueTrend,
      categoryData,
      statusData,
      topProducts,
      recentOrders,
      allOrders
    ] = await Promise.all([

      // ===============================
      // SUMMARY
      // ===============================

      Order.aggregate([
        { $match: match },

        {
          $group: {
            _id: null,

            revenue: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "Completed"] },
                  "$amount",
                  0
                ]
              }
            },

            orders: {
              $sum: 1
            },

            customers: {
              $addToSet: "$customer"
            },

            completedOrders: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "Completed"] },
                  1,
                  0
                ]
              }
            }
          }
        },

        {
          $project: {
            _id: 0,
            revenue: 1,
            orders: 1,
            customers: {
              $size: "$customers"
            },
            completedOrders: 1
          }
        }
      ]),


      // ===============================
      // REVENUE TREND
      // ===============================

      Order.aggregate([
        { $match: match },

        {
          $match: {
            status: "Completed"
          }
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date"
              }
            },

            revenue: {
              $sum: "$amount"
            },

            orders: {
              $sum: 1
            }
          }
        },

        {
          $sort: {
            _id: 1
          }
        }
      ]),


      // ===============================
      // CATEGORY DATA
      // ===============================

      Order.aggregate([
        { $match: match },

        {
          $group: {
            _id: "$category",

            revenue: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "Completed"] },
                  "$amount",
                  0
                ]
              }
            },

            orders: {
              $sum: 1
            }
          }
        },

        {
          $sort: {
            revenue: -1
          }
        }
      ]),


      // ===============================
      // STATUS DATA
      // ===============================

      Order.aggregate([
        { $match: match },

        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1
            }
          }
        },

        {
          $sort: {
            count: -1
          }
        }
      ]),


      // ===============================
      // TOP PRODUCTS
      // ===============================

      Order.aggregate([
        { $match: match },

        {
          $match: {
            status: "Completed"
          }
        },

        {
          $group: {
            _id: "$product",

            revenue: {
              $sum: "$amount"
            },

            units: {
              $sum: 1
            }
          }
        },

        {
          $sort: {
            revenue: -1
          }
        },

        {
          $limit: 5
        }
      ]),


      // ===============================
      // RECENT ORDERS
      // Keep only 8 for Overview
      // ===============================

      Order.find(match)
        .sort({ date: -1 })
        .limit(8)
        .lean(),


      // ===============================
      // ALL ORDERS
      // Used by Orders page
      // ===============================

      Order.find(match)
        .sort({ date: -1 })
        .lean()
    ]);


    // ===============================
    // DEFAULT SUMMARY
    // ===============================

    const base = summary[0] || {
      revenue: 0,
      orders: 0,
      customers: 0,
      completedOrders: 0
    };


    // ===============================
    // RESPONSE
    // ===============================

    res.json({

      summary: {
        revenue: Number(
          base.revenue.toFixed(2)
        ),

        orders: base.orders,

        customers: base.customers,

        averageOrderValue: base.completedOrders
          ? Number(
              (
                base.revenue /
                base.completedOrders
              ).toFixed(2)
            )
          : 0
      },


      // ===============================
      // REVENUE TREND
      // ===============================

      revenueTrend: revenueTrend.map(item => ({
        date: item._id,

        revenue: Number(
          item.revenue.toFixed(2)
        ),

        orders: item.orders
      })),


      // ===============================
      // CATEGORY DATA
      // ===============================

      categoryData: categoryData.map(item => ({
        name: item._id,

        revenue: Number(
          item.revenue.toFixed(2)
        ),

        orders: item.orders
      })),


      // ===============================
      // STATUS DATA
      // ===============================

      statusData: statusData.map(item => ({
        name: item._id,

        value: item.count
      })),


      // ===============================
      // TOP PRODUCTS
      // ===============================

      topProducts: topProducts.map(item => ({
        name: item._id,

        revenue: Number(
          item.revenue.toFixed(2)
        ),

        units: item.units
      })),


      // ===============================
      // ORDERS
      // ===============================

      recentOrders,

      allOrders
    });

  } catch (error) {
    next(error);
  }
});


// ===============================
// OVERVIEW METADATA
// ===============================

router.get("/overview", protect, async (req, res, next) => {
  try {

    const [
      categories,
      statuses
    ] = await Promise.all([

      Order.distinct("category"),

      Order.distinct("status")

    ]);

    res.json({
      categories,
      statuses
    });

  } catch (error) {

    next(error);

  }
});


module.exports = router;