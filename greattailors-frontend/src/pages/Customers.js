import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [orderId, setOrderId] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [filteredOverride, setFilteredOverride] = useState(null);

  // 🔴 MODAL (ONLY FOR TOP INPUT)
  const [showModal, setShowModal] = useState(false);
  const [editMeasurement, setEditMeasurement] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get("https://greattailors-backend.onrender.com/customer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(Array.isArray(res.data) ? res.data : []);
      setFilteredOverride(null);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function addCustomer(e) {
    e.preventDefault();
    try {
      setErr("");
      await axios.post(
        "https://greattailors-backend.onrender.com/customer",
        { name, phone, measurement, orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setPhone("");
      setMeasurement("");
      setOrderId("");
      fetchCustomers();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    }
  }

  function applySearch() {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      setFilteredOverride(null);
      return;
    }

    const result = customers.filter((c) => {
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (c.measurement || "").toLowerCase().includes(q) ||
        (c.orderId || "").toString().includes(q)
      );
    });

    setFilteredOverride(result);
  }

  function resetSearch() {
    setQuery("");
    setFilteredOverride(null);
  }

  // 🔴 OPEN MODAL FROM TOP MEASUREMENT
  function openTopMeasurement() {
    setEditMeasurement(measurement);
    setShowModal(true);
  }

  function handleSave() {
    setMeasurement(editMeasurement);
    setShowModal(false);
  }

  const displayList = Array.isArray(filteredOverride)
    ? filteredOverride
    : customers;

  /* ================= STYLES ================= */
  const page = { padding: 24, background: "#f8fafc", minHeight: "100vh" };
  const input = { padding: 10, borderRadius: 8, border: "1px solid #ccc" };
  const btn = {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  };
  const table = { width: "100%", marginTop: 20, borderCollapse: "collapse" };
  const th = { background: "#3b82f6", color: "#fff", padding: 10 };
  const td = { padding: 10, borderBottom: "1px solid #e5e7eb" };

  return (
    <div style={page}>
      <h2>👥 Customers</h2>

      <form onSubmit={addCustomer} style={{ display: "flex", gap: 10 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
        />
        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={input}
        />

        {/* 🔴 DOUBLE CLICK ONLY HERE */}
        <input
          placeholder="Measurement (Double Click)"
          value={measurement}
          readOnly
          onDoubleClick={openTopMeasurement}
          style={{ ...input, cursor: "pointer", width: 220 }}
        />

        <input
          placeholder="Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={input}
        />
        <button style={btn}>Add</button>
      </form>

      <div style={{ marginTop: 10 }}>
        <input
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...input, width: 250 }}
        />
        <button onClick={applySearch} style={{ ...btn, marginLeft: 8 }}>
          Search
        </button>
        <button onClick={resetSearch} style={{ marginLeft: 8 }}>
          Reset
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Phone</th>
              <th style={th}>Measurement</th>
              <th style={th}>Order</th>
            </tr>
          </thead>
          <tbody>
            {displayList.map((c) => (
              <tr key={c._id}>
                <td style={td}>{c.name}</td>
                <td style={td}>{c.phone}</td>

                {/* ✅ NEW LINE FIX HERE */}
                <td
                  style={{
                    ...td,
                    whiteSpace: "pre-line", // 👈 THIS FIX
                  }}
                >
                  {c.measurement || "—"}
                </td>

                <td style={td}>{c.orderId || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🔴 MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              width: "70%",
              borderRadius: 12,
            }}
          >
            <h3>Enter Measurement</h3>

            <textarea
              rows={8}
              value={editMeasurement}
              onChange={(e) => setEditMeasurement(e.target.value)}
              style={{ width: "100%", padding: 10 }}
            />

            <div style={{ textAlign: "right", marginTop: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ marginRight: 8 }}
              >
                Cancel
              </button>
              <button onClick={handleSave} style={btn}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {err && <p style={{ color: "red" }}>{err}</p>}
    </div>
  );
}
