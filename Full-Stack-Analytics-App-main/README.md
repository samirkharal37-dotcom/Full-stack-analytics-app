# InsightBoard — Full-Stack Analytics Dashboard

A polished full-stack analytics dashboard built for internship/project submission.

## Stack
- Frontend: React + Vite + Recharts
- Backend: Node.js + Express
- Database: MongoDB / MongoDB Atlas
- Authentication: JWT + bcrypt
- UI: Responsive CSS with dashboard cards, charts, tables and filters

## Features
- Secure register/login
- JWT-protected analytics APIs
- KPI cards: revenue, orders, customers, average order value
- Revenue trend chart
- Orders by category
- Order status distribution
- Top products
- Recent orders table
- Date-range and category filters
- Responsive sidebar/dashboard UI
- Demo-data seed endpoint
- Health endpoint for deployment checks

## 1. Backend setup

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/analytics_dashboard?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Start:

```bash
npm run dev
```

The backend runs on `http://localhost:5000`.

Seed demo data after the server starts:

```bash
npm run seed
```

Demo login:
- Email: `demo@insightboard.com`
- Password: `Demo@12345`

## 2. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
```

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start:

```bash
npm run dev
```

Open the URL shown by Vite, normally `http://localhost:5173`.

## Deployment

### Backend — Render
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`

### Frontend — Vercel
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Add:
  `VITE_API_URL=https://YOUR-BACKEND.onrender.com/api`

After deployment, update the backend `CLIENT_URL` to the Vercel URL.

## Important
Do not commit real `.env` files. Only commit `.env.example`.
