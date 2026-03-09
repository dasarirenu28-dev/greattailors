// src/components/Layout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const linkStyle = ({ isActive }) => ({
    padding: "6px 10px",
    marginRight: "6px",
    textDecoration: "none",
    background: isActive ? "#4f46e5" : "#e9e9e9",
    color: isActive ? "#fff" : "#333",
    borderRadius: "6px",
  });

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      <header style={{ padding: 10, background: "#f8f8f8", display: "flex", justifyContent: "space-between" }}>
        <h2>Great Tailors</h2>
        <button onClick={logout}>Logout</button>
      </header>

      <nav style={{ padding: 10, background: "#eee" }}>
        <NavLink to="/app/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/app/customers" style={linkStyle}>Customers</NavLink>
        <NavLink to="/app/orders" style={linkStyle}>Orders</NavLink>
      </nav>

      <main style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
