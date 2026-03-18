// src/App.js
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

/* PAGES */
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomersPage from "./pages/Customers";
import OrdersPage from "./pages/Orders";
import PaymentsPage from "./pages/Payments";
import ForgotPassword from "./pages/ForgotPassword";
import Workers from "./pages/Workers";
import Delivery from "./pages/Delivery";

/* OTHER PAGES */
import Vendors from "./pages/Vendors";
import Warehouse from "./pages/Warehouse";

/* ================= PROTECTED ROUTE ================= */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return children;
}

/* ================= MAIN LAYOUT ================= */
function Layout() {
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    padding: "6px 10px",
    marginRight: "8px",
    borderRadius: "6px",
    textDecoration: "none",
    background: isActive ? "#4f46e5" : "#e9e9e9",
    color: isActive ? "#fff" : "#333",
    display: "inline-block",
  });

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      {/* ---------------- HEADER ---------------- */}
      <header
        style={{
          background: "#f8f8f8",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>Great Tailors</h2>
        <button onClick={logout}>Logout</button>
      </header>

      {/* ---------------- NAVIGATION ---------------- */}
      <nav style={{ background: "#eee", padding: "10px 20px" }}>
        <NavLink to="/app/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>

        <NavLink to="/app/customers" style={linkStyle}>
          Customers
        </NavLink>

        <NavLink to="/app/orders" style={linkStyle}>
          Orders
        </NavLink>

        <NavLink to="/app/payments" style={linkStyle}>
          Payments
        </NavLink>
        <NavLink to="/app/Workers" style={linkStyle}>
          Workers
        </NavLink>
    
        <NavLink to="/app/vendors" style={linkStyle}>
          Vendors
        </NavLink>

        <NavLink to="/app/warehouse" style={linkStyle}>
          Warehouse
        </NavLink>

        {/* ✅ DELIVERY TAB (FIXED) */}
        <NavLink to="/app/delivery" style={linkStyle}>
          Delivery
        </NavLink>
      </nav>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}

/* ================= APP ROOT ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- PUBLIC ---------- */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ---------- PROTECTED ---------- */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="Workers" element={<Workers />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="warehouse" element={<Warehouse />} />

          {/* ✅ DELIVERY ROUTE (FIXED) */}
          <Route path="delivery" element={<Delivery />} />
        </Route>

        {/* ---------- 404 ---------- */}
        <Route
          path="*"
          element={<div style={{ padding: 40 }}>Page not found</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}
