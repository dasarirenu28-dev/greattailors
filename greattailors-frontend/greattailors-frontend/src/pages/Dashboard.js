import React, { useEffect, useState } from "react";
import API from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";

/* ==================== Constants ==================== */
const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer"];
const DELIVERY_VALUES = ["Pending", "InProcess", "Completed", "Delivered"];
const DELIVERY_LABEL = {
  Pending: "Pending",
  InProcess: "In-Process",
  Completed: "Completed",
  Delivered: "Delivered",
};

// chart colours
const COLORS_PAYMENT = ["#f97316", "#3b82f6", "#22c55e", "#8b5cf6"]; // cash, upi, card, bank
const COLORS_DELIVERY = ["#facc15", "#0ea5e9", "#10b981", "#6366f1"]; // pending, inprocess, completed, delivered

/* ==================== Normalisers ==================== */
const normMethod = (m) => {
  if (!m) return "Cash";
  const key = String(m).trim().toLowerCase();
  if (key.includes("upi")) return "UPI";
  if (key.includes("card")) return "Card";
  if (key.includes("bank")) return "Bank Transfer";
  if (key.includes("cash")) return "Cash";
  return "Cash";
};

const normDelivery = (s) => {
  if (!s) return "Pending";
  const key = String(s).trim().toLowerCase().replace(/\s+/g, "");
  if (key === "inprocess" || key === "in-progress" || key === "inprogress")
    return "InProcess";
  if (key === "completed") return "Completed";
  if (key === "delivered") return "Delivered";
  return "Pending";
};

/* ==================== Styles ==================== */
const InlineStyles = () => (
  <style>{`
    :root{
      --sidebar-bg:#0f1b2a;
      --sidebar-accent:#13253a;
      --card-radius:14px;
      --card-shadow:0 8px 20px rgba(0,0,0,.06);
    }
    *{box-sizing:border-box}
    .layout{display:flex; min-height:100vh; background:#f5f7fb; color:#111827; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",Arial;}
    .sidebar{width:240px; background:var(--sidebar-bg); color:#dde6f7; display:flex; flex-direction:column;}
    .brand{padding:18px; font-weight:700; font-size:18px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; align-items:center; gap:10px}
    .menu{padding:10px}
    .menu a{display:flex; align-items:center; gap:12px; color:#cbd5e1; text-decoration:none; padding:10px 12px; border-radius:10px; margin-bottom:4px}
    .menu a.active, .menu a:hover{background:var(--sidebar-accent); color:#fff}
    .content{flex:1; display:flex; flex-direction:column;}
    .topbar{height:56px; background:#fff; border-bottom:1px solid #eef1f6; display:flex; align-items:center; justify-content:space-between; padding:0 18px}
    .search{display:flex; align-items:center; gap:8px; background:#f0f3f9; border-radius:10px; padding:8px 12px; min-width:220px}
    .cards{display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin:16px 18px}
    .grid2{display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:0 18px 18px}
    .panel{background:#fff; border:1px solid #eef1f6; border-radius:var(--card-radius); box-shadow:var(--card-shadow); overflow:hidden}
    .panel .head{display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #f1f4f9; font-weight:600}
    .panel .body{padding:12px 8px 4px 12px; height:360px}
    .footer-note{padding:8px 18px 22px; font-size:12px; color:#6b7280}
    @media (max-width:1100px){
      .cards{grid-template-columns:repeat(2,minmax(0,1fr))}
      .grid2{grid-template-columns:1fr}
    }
  `}</style>
);

const StatCard = ({ title, value, color }) => (
  <div
    style={{
      background: color,
      borderRadius: "12px",
      color: "#fff",
      padding: "18px",
      boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
    }}
  >
    <div style={{ fontSize: "14px", fontWeight: "500" }}>{title}</div>
    <div
      style={{
        fontSize: "26px",
        fontWeight: "700",
        margin: "4px 0 6px",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: "12px",
        opacity: 0.9,
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      More info <FiChevronRight size={14} />
    </div>
  </div>
);

const ChartPanel = ({ title, children }) => (
  <div className="panel">
    <div className="head">
      <span>{title}</span>
      <span style={{ opacity: 0.7 }}>⋮</span>
    </div>
    <div className="body">{children}</div>
  </div>
);

/* ==================== Component ==================== */
export default function Dashboard() {
  const [summary, setSummary] = useState({
    revenue: 0,
    pendingPayments: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });

  const [ordersPerCategory, setOrdersPerCategory] = useState([]);
  const [paymentDist, setPaymentDist] = useState([]);
  const [deliveryDist, setDeliveryDist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");

      try {
        let ordersList = [];
        let customersList = [];

        /* ----- Load orders ----- */
        try {
          const ordersRes = await API.get("/orders");
          const ordersData = ordersRes.data;
          ordersList = Array.isArray(ordersData)
            ? ordersData
            : Array.isArray(ordersData?.orders)
            ? ordersData.orders
            : [];
        } catch (e) {
          if (e.response?.status !== 404) throw e;
          ordersList = [];
        }

        /* ----- Load customers (your response is a plain array) ----- */
        try {
          const custRes = await API.get("/customer");
          const custData = custRes.data;
          console.log("Customers API data (Dashboard):", custData);
          customersList = Array.isArray(custData)
            ? custData
            : Array.isArray(custData?.customers)
            ? custData.customers
            : [];
        } catch (e) {
          if (e.response?.status !== 404) throw e;
          customersList = [];
        }

        /* ----- Unique customers from orders (fallback) ----- */
        const customerSet = new Set();
        for (const o of ordersList) {
          const key =
            o.customerId ??
            o.customerID ??
            o.customer_id ??
            o.customerCode ??
            o.customer_code ??
            o.customerName ??
            o.customer ??
            o.name;
          if (key) customerSet.add(String(key).trim());
        }
        const customersFromOrders = customerSet.size;

        /* ----- Summary from orders + customers ----- */
        const revenue = ordersList.reduce((sum, o) => {
          const total =
            Number(
              o.totalAmount ??
                o.total ??
                o.grandTotal ??
                o.amount ??
                0
            ) || 0;
          const status = String(o.paymentStatus || "").toLowerCase();
          if (
            status === "paid" ||
            status === "completed" ||
            status === "settled"
          ) {
            return sum + total;
          }
          return sum;
        }, 0);

        const pendingPayments = ordersList.reduce((sum, o) => {
          const total =
            Number(
              o.totalAmount ??
                o.total ??
                o.grandTotal ??
                o.amount ??
                0
            ) || 0;
          const paid =
            Number(o.paidAmount ?? o.amountPaid ?? 0) || 0;
          const status = String(o.paymentStatus || "").toLowerCase();

          if (
            status === "paid" ||
            status === "completed" ||
            status === "settled"
          ) {
            return sum;
          }

          const pending = total - paid;
          return sum + (pending > 0 ? pending : 0);
        }, 0);

        setSummary({
          revenue,
          pendingPayments,
          totalOrders: ordersList.length,
          // If customers API gives 14, this will be 14;
          // otherwise we fall back to unique customers from orders.
          totalCustomers:
            customersList.length > 0
              ? customersList.length
              : customersFromOrders,
        });

        /* ----- Payment distribution (Paid orders only) ----- */
        const payCounts = Object.fromEntries(
          PAYMENT_METHODS.map((k) => [k, 0])
        );
        for (const o of ordersList) {
          if (String(o.paymentStatus || "").toLowerCase() === "paid") {
            const m = normMethod(o.paymentMethod);
            payCounts[m] = (payCounts[m] || 0) + 1;
          }
        }
        setPaymentDist(
          PAYMENT_METHODS.map((k) => ({
            name: k,
            value: payCounts[k] || 0,
          }))
        );

        /* ----- Delivery distribution ----- */
        const delCounts = Object.fromEntries(
          DELIVERY_VALUES.map((k) => [k, 0])
        );
        for (const o of ordersList) {
          const s = normDelivery(o.deliveryStatus);
          delCounts[s] = (delCounts[s] || 0) + 1;
        }
        setDeliveryDist(
          DELIVERY_VALUES.map((k) => ({
            name: DELIVERY_LABEL[k],
            value: delCounts[k] || 0,
          }))
        );

        /* ----- Orders per Category (group by service or itemName) ----- */
        const catCounts = {};
        for (const o of ordersList) {
          const items = Array.isArray(o.items) ? o.items : [];
          for (const it of items) {
            const key = (it.service || it.itemName || "Other").toString();
            catCounts[key] =
              (catCounts[key] || 0) + Number(it.quantity || 1);
          }
        }
        const catData = Object.entries(catCounts).map(
          ([name, value]) => ({
            name,
            value,
          })
        );
        setOrdersPerCategory(
          catData.length
            ? catData
            : [
                { name: "Shirts", value: 36 },
                { name: "Pants", value: 20 },
                { name: "Blouses", value: 18 },
                { name: "Alterations", value: 28 },
                { name: "Saree", value: 14 },
              ]
        );
      } catch (e) {
        console.error(e);
        const msg =
          e.response?.data?.message ||
          e.response?.data?.error ||
          e.message ||
          "Failed to load dashboard";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading dashboard…</div>;

  return (
    <div className="layout">
      <InlineStyles />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <FiHome /> Great Tailors
        </div>
        <nav className="menu">
          <a href="#" className="active">
            <FiHome /> Dashboard
          </a>
          <a href="#">
            <FiUsers /> Customers
          </a>
          <a href="#">
            <FiShoppingBag /> Orders
          </a>
          <a href="#">
            <FiCreditCard /> Payments
          </a>
          <a href="#">
            <FiSettings /> Settings
          </a>
          <a href="#">
            <FiLogOut /> Logout
          </a>
        </nav>
      </aside>

      {/* Main */}
      <section className="content">
        <div className="topbar">
          <div style={{ fontWeight: 700 }}>Dashboard</div>
          <div className="search">
            <input
              placeholder="Search..."
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
              }}
            />
            <FiChevronRight />
          </div>
        </div>

        {err && (
          <div
            style={{
              color: "#b91c1c",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              padding: "8px 12px",
              margin: "12px 18px",
              borderRadius: 8,
            }}
          >
            {err}
          </div>
        )}

        {/* Top stat cards */}
        <div className="cards">
          <StatCard
            title="Total Revenue"
            value={`₹${summary.revenue}`}
            color="#ef4444"
          />
          <StatCard
            title="Pending Payments"
            value={`₹${summary.pendingPayments}`}
            color="#3b82f6"
          />
          <StatCard
            title="Total Orders"
            value={summary.totalOrders}
            color="#10b981"
          />
          <StatCard
            title="Customers"
            value={summary.totalCustomers}
            color="#ec4899"
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid2">
          <ChartPanel title="Orders per Category">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersPerCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="Payment Method Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {paymentDist.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS_PAYMENT[i % COLORS_PAYMENT.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        </div>

        {/* Charts row 2 */}
        <div className="grid2">
          <ChartPanel title="Delivery Status Overview">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {deliveryDist.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS_DELIVERY[i % COLORS_DELIVERY.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>

          <div /> {/* empty right panel placeholder */}
        </div>

        <div className="footer-note">
          The payment pie counts only <b>Paid</b> orders by their chosen method.
          Delivery chart shows all orders. Normalisation handles variants such
          as “UPI Payment”, “Bank_Transfer”, “in progress”.
        </div>
      </section>
    </div>
  );
}
