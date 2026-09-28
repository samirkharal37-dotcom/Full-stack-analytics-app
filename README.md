📊 InsightBoard — Full-Stack Analytics Dashboard

InsightBoard is a modern full-stack analytics dashboard designed to help businesses monitor and understand their sales, orders, customers, traffic, and overall business performance from a single interface.

The application is built with React, Node.js, Express.js, and MongoDB and includes authentication, analytics visualization, order management, filtering, and report export functionality.

🚀 Features
📈 Analytics Dashboard
Revenue and sales overview
Order statistics
Customer and traffic analytics
Monthly performance visualization
Top-performing products
Interactive charts
Dashboard summary cards
🛒 Order Management
View orders
Update order information
Filter orders
Search orders
Track order status
Export order data as CSV
🔐 Authentication
User registration
User login
JWT-based authentication
Password hashing with bcrypt
Protected API routes
Secure authentication flow
📊 Data Visualization
Revenue charts
Sales trends
Traffic analytics
Product performance
Monthly order statistics
Responsive charts
📱 Responsive Design
Desktop dashboard
Tablet support
Mobile-friendly layout
Responsive navigation
Clean modern interface
🛠️ Tech Stack
Frontend
React.js
Vite
JavaScript
CSS
Recharts
Axios
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT
bcryptjs
dotenv
CORS
Development Tools
Git
GitHub
Nodemon
MongoDB Atlas
VS Code
🏗️ Project Architecture
InsightBoard
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
├── .gitignore
└── README.md
⚙️ Installation
1. Clone the repository
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git

Move into the project:

cd Full-Stack-Analytics-App-main
🔧 Backend Setup

Open a terminal inside the backend directory:

cd backend

Install dependencies:

npm install

Create a .env file:

backend/.env

Add:

PORT=5000

MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING

JWT_SECRET=YOUR_LONG_RANDOM_SECRET

CLIENT_URL=http://localhost:5173
Example
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/insightboard
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173

Never commit your real .env file or database credentials to GitHub.

Start the backend:

npm run dev

The backend will run at:

http://localhost:5000
🎨 Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Create:

frontend/.env

Add:

VITE_API_URL=http://localhost:5000/api

Start the frontend:

npm run dev

The frontend will normally be available at:

http://localhost:5173
🗄️ MongoDB Setup

InsightBoard uses MongoDB Atlas for database storage.

Setup Steps
Create a MongoDB Atlas account.
Create a free cluster.
Create a database user.
Configure Network Access.
Copy the MongoDB connection string.
Add it to backend/.env.

Example:

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/insightboard

The application uses MongoDB/Mongoose to manage application data.

🔑 Environment Variables
Backend

Create:

backend/.env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
Frontend

Create:

frontend/.env
VITE_API_URL=http://localhost:5000/api

For security, .env files should not be committed to GitHub.

Use .env.example files to document the required variables.

🔌 API Overview
Authentication
POST /api/auth/register
POST /api/auth/login
Analytics
GET /api/analytics
GET /api/analytics/summary
GET /api/analytics/overview
Orders
GET    /api/orders
POST   /api/orders
PUT    /api/orders/:id
DELETE /api/orders/:id

All protected endpoints require a valid JWT authentication token.

🔐 Security

The application implements several security practices:

JWT authentication
Password hashing with bcrypt
Protected API routes
Environment variables for sensitive configuration
CORS configuration
Server-side authentication middleware

For production deployment, additional security measures such as rate limiting, security headers, input validation, and stricter CORS policies are recommended.

📊 Dashboard

The dashboard provides an overview of important business metrics including:

Revenue
Orders
Customers
Traffic
Sales
Products

Users can analyze trends through interactive charts and filter available data.

🧪 Development

Run the backend:

cd backend
npm run dev

Run the frontend in another terminal:

cd frontend
npm run dev
🚀 Production Deployment

The application can be deployed using services such as:

Frontend: Vercel
Backend: Render
Database: MongoDB Atlas

Production environment variables should be configured through the hosting provider instead of committing .env files.

Example production frontend variable:

VITE_API_URL=https://your-backend-domain.com/api

Example backend variables:

PORT=5000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=https://your-frontend-domain.com
