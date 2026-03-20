import React, { useEffect, useState } from "react";
import axios from "axios";

const API =
  process.env.REACT_APP_API_BASE || "https://greattailors-backend.onrender.com";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    const res = await axios.get(`${API}/vendors`);
    setVendors(res.data || []);
  }

  async function createVendor(e) {
    e.preventDefault();
    await axios.post(`${API}/vendors`, form);
    setForm({ name: "", phone: "", address: "" });
    loadVendors();
  }

  return (
    <div style={page}>
      <h1 style={title}>🏭 Vendor Management</h1>
      <p style={subTitle}>Add & manage warehouse vendors</p>

      {/* ADD VENDOR */}
      <div style={card}>
        <h3 style={cardTitle}>➕ Add Vendor</h3>

        <form onSubmit={createVendor} style={formRow}>
          <input
            style={input}
            placeholder="Vendor Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            style={input}
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <input
            style={input}
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          <button style={btnPrimary}>Add Vendor</button>
        </form>
      </div>

      {/* VENDOR LIST */}
      <div style={card}>
        <h3 style={cardTitle}>📋 Vendor List</h3>

        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Phone</th>
              <th style={th}>Address</th>
            </tr>
          </thead>

          <tbody>
            {vendors.map((v) => (
              <tr key={v._id}>
                <td style={tdName}>{v.name}</td>
                <td style={td}>{v.phone || "—"}</td>
                <td style={td}>{v.address || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  padding: 24,
  minHeight: "100vh",
  background:
    "linear-gradient(135deg,#fdf4ff,#ecfeff)",
};

const title = {
  fontSize: 30,
  fontWeight: 800,
};

const subTitle = {
  color: "#475569",
  marginBottom: 20,
};

const card = {
  background: "#fff",
  padding: 20,
  marginBottom: 24,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,.08)",
};

const cardTitle = {
  fontSize: 18,
  marginBottom: 14,
};

const formRow = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};

const input = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #c7d2fe",
  minWidth: 180,
};

const btnPrimary = {
  padding: "10px 18px",
  borderRadius: 999,
  border: "none",
  background:
    "linear-gradient(90deg,#4f46e5,#06b6d4)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  padding: 10,
  color: "#fff",
  background:
    "linear-gradient(90deg,#6366f1,#22d3ee)",
  textAlign: "left",
};

const td = {
  padding: 12,
  borderBottom: "1px solid #e5e7eb",
};

const tdName = {
  ...td,
  fontWeight: 700,
};
