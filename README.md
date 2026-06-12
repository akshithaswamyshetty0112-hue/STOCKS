# Individual(Stocks) - Stock Trading Simulator

A full-stack MERN stock trading simulator where users can register, trade virtual stocks, manage portfolios, track transactions, add funds through Razorpay, request withdrawals, and view simulated market activity. The project also includes admin tools for user management, stock controls, analytics, audit logs, and notifications.

## Features

- User registration and login with JWT authentication
- Protected user dashboard
- Virtual stock listings and stock detail pages
- Buy and sell simulated stocks
- Portfolio balance and holdings tracking
- Transaction history
- Market simulation and market status display
- Razorpay deposit order creation and payment verification
- Withdrawal request flow
- User notifications
- Admin dashboard with analytics
- Admin user management
- Audit log tracking

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Razorpay API integration through Axios

## Project Structure

Individual(Stocks)/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- .env
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   `-- services/
|   |-- .env
|   |-- package.json
|   `-- vite.config.js
|-- package.json
`-- README.md
```

## Prerequisites

- Node.js
- npm
- MongoDB running locally or a MongoDB Atlas URI
- Razorpay test or live API keys

## Environment Variables

Create or update `backend/.env`:

--env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/stock_trading_simulator
JWT_SECRET=your_jwt_secret
STOCK_API_KEY=
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@gmail.com
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Create or update `frontend/.env`:

--env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

Do not commit real secrets to GitHub.

## Installation

Install backend dependencies:


cd backend
npm install


Install frontend dependencies:


cd frontend
npm install


## Running Locally

Start the backend server:


cd backend
npm run dev

The backend runs on:


http://localhost:5000


Start the frontend development server:


cd frontend
npm run dev


The frontend runs on:
http://localhost:5173


## Deploying on Render

This repository contains separate backend and frontend apps. You can deploy them as two Render services.

### Backend Web Service

If deploying from the repository root, use:


Build Command: npm run build
Start Command: npm start


Add these environment variables in the Render dashboard:

--env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=your_frontend_url
ADMIN_EMAIL=admin@gmail.com
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret


Do not use `mongodb://127.0.0.1:27017/...` on Render. Use MongoDB Atlas or another hosted MongoDB connection string.

### Frontend Static Site

Use these Render settings:


Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist


Add these frontend environment variables:

env
VITE_API_URL=https://your-backend-service.onrender.com/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id


## Available Scripts

### Root


npm run build
npm start


The root scripts install and start the backend for deployment platforms.

### Backend


npm run dev
npm start


### Frontend


npm run dev
npm run build
npm run preview


## API Overview

Main backend route groups:

- `/api/auth` - register, login, current user
- `/api/stocks` - stock data
- `/api/portfolio` - user portfolio
- `/api/transactions` - trading transactions
- `/api/market` - market simulation/status
- `/api/payment` - deposits, verification, withdrawals, transaction history
- `/api/admin` - admin dashboard and management
- `/api/notifications` - user notifications

## Payment Flow

1. The frontend calls `POST /api/payment/create-order`.
2. The backend creates a Razorpay order.
3. The frontend opens Razorpay Checkout.
4. After payment, the frontend sends payment details to `POST /api/payment/verify`.
5. The backend verifies the signature and updates the user balance.

## Notes

- Restart the backend after changing `backend/.env`.
- Restart the frontend after changing `frontend/.env`.
- Use Razorpay test keys during development.
- MongoDB must be running before starting the backend locally.
- Render needs environment variables configured in the dashboard; it does not read your local `.env` files.

## License

This project is licensed under the ISC License.
