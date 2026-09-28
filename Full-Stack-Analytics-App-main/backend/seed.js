const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Order = require("./models/Order");

dotenv.config();

const products = [
  ["Pro Laptop X1", "Technology", 1299],
  ["Wireless Headphones", "Technology", 149],
  ["Smart Watch S5", "Technology", 299],
  ["Running Shoes", "Sports", 119],
  ["Premium Backpack", "Fashion", 89],
  ["Fitness Tracker", "Sports", 79],
  ["Air Purifier", "Home", 249],
  ["Skincare Set", "Beauty", 69],
  ["Ergonomic Chair", "Home", 399],
  ["Classic Jacket", "Fashion", 159]
];

const customers = [
  "Aarav Sharma", "Diya Patel", "Rohan Mehta", "Ananya Singh",
  "Kabir Joshi", "Meera Nair", "Arjun Verma", "Sara Khan",
  "Aditya Rao", "Ishita Das", "Neha Kapoor", "Vikram Shah"
];

function makeDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(10 + (daysAgo % 8), (daysAgo * 7) % 60, 0, 0);
  return d;
}

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing.");

  await mongoose.connect(process.env.MONGO_URI);

  const password = await bcrypt.hash("Demo@12345", 10);
  await User.findOneAndUpdate(
    { email: "demo@insightboard.com" },
    { name: "Demo Analyst", email: "demo@insightboard.com", password },
    { upsert: true, new: true }
  );

  await Order.deleteMany({});

  const orders = Array.from({ length: 60 }, (_, i) => {
    const product = products[i % products.length];
    const customer = customers[(i * 3) % customers.length];
    const statuses = ["Completed", "Completed", "Completed", "Pending", "Cancelled", "Refunded"];
    const status = statuses[i % statuses.length];
    const amount = Math.round(product[2] * (0.82 + ((i * 13) % 36) / 100));

    return {
      orderId: `ORD-${String(10001 + i)}`,
      customer,
      product: product[0],
      category: product[1],
      amount,
      status,
      date: makeDate(i % 30)
    };
  });

  await Order.insertMany(orders);

  console.log("Demo user and 60 orders created.");
  console.log("Email: demo@insightboard.com");
  console.log("Password: Demo@12345");

  await mongoose.disconnect();
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
