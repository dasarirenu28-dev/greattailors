import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const DELIVERY_STATUS = ["Pending", "InProcess", "Completed", "Delivered"];

export default function Delivery() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await axios.get(`${API_BASE}/orders`);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  }

  // 🔁 STATUS UPDATE (SYNC WITH ORDERS)
  async function updateDeliveryStatus(orderId, status) {
    try {
      await axios.patch(`${API_BASE}/orders/${orderId}`, {
        deliveryStatus: status,
      });
      loadOrders();
    } catch {
      alert("Failed to update status");
    }
  }

  // ===== DATE HELPERS (IST SAFE) =====
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const onlyDate = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN") : "-";

  // ===== FILTERS =====

  // 📦 TODAY
  const todayDeliveries = orders.filter((o) => {
    if (!o.deliveryDate) return false;
    return onlyDate(o.deliveryDate).getTime() === today.getTime();
  });

  // 📆 UPCOMING (NEXT 3 DAYS)
  const upcomingDeliveries = orders.filter((o) => {
    if (!o.deliveryDate) return false;

    const d = onlyDate(o.deliveryDate);
    return d > today && d <= addDays(today, 3);
  });

  // ⛔ OVERDUE
  const overdueDeliveries = orders.filter((o) => {
    if (!o.deliveryDate) return false;

    return (
      onlyDate(o.deliveryDate) < today &&
      o.deliveryStatus !== "Delivered"
    );
  });

  const statusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#16a34a";
      case "Completed":
        return "#2563eb";
      case "InProcess":
        return "#ca8a04";
      default:
        return "#dc2626";
    }
  };

  const renderTable = (list, rowBg) => (
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>Order ID</th>
          <th style={th}>Customer</th>
          <th style={th}>Items</th>
          <th style={th}>Worker</th>
          <th style={th}>Delivery Date</th>
          <th style={th}>Status</th>
        </tr>
      </thead>
      <tbody>
        {list.map((o) => (
          <tr key={o._id} style={{ background: rowBg }}>
            <td>{o.customerId?.orderId}</td>
            <td>{o.customerId?.name}</td>

            <td>
              {o.items.map((i, x) => (
                <div key={x}>
                  {i.itemName} - {i.service}
                </div>
              ))}
            </td>

            <td>
              {o.items.map((i, x) => (
                <div key={x}>{i.worker?.name || "-"}</div>
              ))}
            </td>

            <td>{formatDate(o.deliveryDate)}</td>

            <td>
              <select
                value={o.deliveryStatus}
                onChange={(e) =>
                  updateDeliveryStatus(o._id, e.target.value)
                }
                disabled={o.deliveryStatus === "Delivered"}
                style={{
                  padding: 6,
                  borderRadius: 8,
                  fontWeight: 600,
                  color: statusColor(o.deliveryStatus),
                }}
              >
                {DELIVERY_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 24, marginBottom: 20 }}>
        🚚 Delivery Dashboard
      </h2>

      {/* TODAY */}
      <div style={card}>
        <h3 style={{ color: "#16a34a" }}>📦 Today’s Deliveries</h3>
        {todayDeliveries.length === 0 ? (
          <p style={muted}>No deliveries today</p>
        ) : (
          renderTable(todayDeliveries)
        )}
      </div>

      {/* UPCOMING */}
      <div style={{ ...card, marginTop: 30, borderLeft: "6px solid #2563eb" }}>
        <h3 style={{ color: "#2563eb" }}>
          📆 Upcoming Deliveries (Next 3 Days)
        </h3>
        {upcomingDeliveries.length === 0 ? (
          <p style={muted}>No upcoming deliveries</p>
        ) : (
          renderTable(upcomingDeliveries, "#eff6ff")
        )}
      </div>

      {/* OVERDUE */}
      <div style={{ ...card, marginTop: 30, borderLeft: "6px solid #ef4444" }}>
        <h3 style={{ color: "#dc2626" }}>⛔ Overdue Deliveries</h3>
        {overdueDeliveries.length === 0 ? (
          <p style={muted}>No overdue deliveries 🎉</p>
        ) : (
          renderTable(overdueDeliveries, "#fee2e2")
        )}
      </div>
    </div>
  );
}

/* ===== STYLES ===== */
const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 14,
  boxShadow: "0 10px 25px rgba(0,0,0,.08)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 12,
};

const th = {
  background: "linear-gradient(90deg,#6366f1,#22d3ee)",
  color: "#fff",
  padding: 10,
  textAlign: "left",
};

const muted = { color: "#6b7280" };
