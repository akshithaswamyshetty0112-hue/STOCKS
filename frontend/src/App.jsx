import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Register from "./pages/Register.jsx";
import Transactions from "./pages/Transactions.jsx";
import StockDetail from "./pages/StockDetail.jsx";
import Stocks from "./pages/Stocks.jsx";
import { useAuth } from "./context/AuthContext.jsx";

// Redirect already-logged-in users away from auth pages
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return children;
}

function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />

          {/* Auth — guests only */}
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Admin panel — admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* User pages — accessible by both user AND admin */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["user", "admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute roles={["user", "admin"]}>
                <Portfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute roles={["user", "admin"]}>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock/:symbol"
            element={
              <ProtectedRoute roles={["user", "admin"]}>
                <StockDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stocks"
            element={
              <ProtectedRoute roles={["user", "admin"]}>
                <Stocks />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;

