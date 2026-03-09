import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./workers.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const WORK_STATUS_OPTIONS = ["Pending", "InProcess", "Completed"];

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    specialization: "",
    status: "Active",
  });

  const [search, setSearch] = useState({
    orderId: "",
    worker: "",
    status: "",
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  async function fetchWorkers() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/workers/with-works`);
      setWorkers(res.data || []);
    } catch {
      alert("Failed to load workers");
    } finally {
      setLoading(false);
    }
  }

  async function createWorker(e) {
    e.preventDefault();
    await axios.post(`${API_BASE}/workers`, form);
    setForm({ name: "", mobile: "", specialization: "", status: "Active" });
    fetchWorkers();
  }

  async function updateWorkStatus(orderId, status) {
    await axios.patch(`${API_BASE}/orders/${orderId}`, {
      workerStatus: status,
    });

    setWorkers((prev) =>
      prev.map((w) => ({
        ...w,
        currentWorks: w.currentWorks.map((wk) =>
          wk.orderId === orderId ? { ...wk, workStatus: status } : wk
        ),
      }))
    );
  }

  /* ========= FLATTEN WORK ROWS ========= */
  const workRows = useMemo(() => {
    const rows = [];
    workers.forEach((w) =>
      (w.currentWorks || []).forEach((wk) =>
        rows.push({
          orderId: wk.orderNumber || wk.orderId,
          createdAt: wk.orderCreatedAt,
          worker: w.name,
          customer: wk.customerName,
          item: wk.service,
          qty: wk.quantity,
          status: wk.workStatus,
          rawOrderId: wk.orderId,
        })
      )
    );
    return rows;
  }, [workers]);

  const filteredRows = workRows.filter((r) => {
    return (
      (!search.orderId || String(r.orderId).includes(search.orderId)) &&
      (!search.worker ||
        r.worker.toLowerCase().includes(search.worker.toLowerCase())) &&
      (!search.status || r.status === search.status)
    );
  });

  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

  const statusColor = (s) =>
    s === "Completed"
      ? "#bbf7d0"
      : s === "InProcess"
      ? "#e0f2fe"
      : "#fef3c7";

  return (
    <div style={page}>
      <h1 style={title}>👷 Worker Management</h1>
      <p style={sub}>Worker details & colorful work tracking</p>

      {/* CREATE + INFO */}
      <div style={grid}>
        <div style={card}>
          <h3 style={cardTitle}>➕ Create Worker</h3>
          <form onSubmit={createWorker} style={formCol}>
            <input
              placeholder="Worker Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={input}
              required
            />
            <input
              placeholder="Mobile"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              style={input}
            />
            <input
              placeholder="Specialization"
              value={form.specialization}
              onChange={(e) =>
                setForm({ ...form, specialization: e.target.value })
              }
              style={input}
            />
            <button style={btnGreen}>💾 Save Worker</button>
          </form>
        </div>

        {/* ✅ WORKER INFO (STATUS + PENDING REMOVED) */}
        <div style={card}>
          <h3 style={cardTitle}>👤 Worker Info</h3>
          <table style={table}>
            <thead>
              <tr>
                {["Name", "Mobile", "Specialization"].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w._id}>
                  <td style={tdName}>{w.name}</td>
                  <td style={td}>{w.mobile || "—"}</td>
                  <td style={td}>{w.specialization || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WORK DETAILS */}
      <div style={cardWide}>
        <h3 style={cardTitle}>🧵 Work Assignment Details</h3>

        <div style={searchRow}>
          <input
            placeholder="🔍 Order ID"
            value={search.orderId}
            onChange={(e) =>
              setSearch({ ...search, orderId: e.target.value })
            }
            style={input}
          />
          <input
            placeholder="🔍 Worker"
            value={search.worker}
            onChange={(e) =>
              setSearch({ ...search, worker: e.target.value })
            }
            style={input}
          />
          <select
            value={search.status}
            onChange={(e) =>
              setSearch({ ...search, status: e.target.value })
            }
            style={input}
          >
            <option value="">All Status</option>
            {WORK_STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <table style={table}>
          <thead>
            <tr>
              {[
                "Order ID",
                "Order Date",
                "Worker",
                "Customer",
                "Item",
                "Qty",
                "Status",
              ].map((h) => (
                <th key={h} style={thGrad}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, i) => (
              <tr key={i}>
                <td style={tdMono}>{r.orderId}</td>
                <td style={td}>{fmt(r.createdAt)}</td>
                <td style={tdName}>{r.worker}</td>
                <td style={td}>{r.customer}</td>
                <td style={td}>{r.item}</td>
                <td style={tdCenter}>{r.qty}</td>
                <td style={td}>
                  <select
                    value={r.status}
                    onChange={(e) =>
                      updateWorkStatus(r.rawOrderId, e.target.value)
                    }
                    style={{
                      ...input,
                      background: statusColor(r.status),
                      fontWeight: 600,
                    }}
                  >
                    {WORK_STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div style={loader}>Loading…</div>}
      </div>
    </div>
  );
}

/* 🎨 STYLES (UNCHANGED) */
const page = {
  padding: 24,
  minHeight: "100vh",
  background: "linear-gradient(135deg,#fdf4ff,#ecfeff)",
};

const title = { fontSize: 30, fontWeight: 800 };
const sub = { color: "#475569", marginBottom: 20 };

const grid = { display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 };

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 18,
  boxShadow: "0 10px 30px rgba(0,0,0,.1)",
};

const cardWide = { ...card, marginTop: 24 };

const cardTitle = { fontSize: 18, marginBottom: 12 };

const formCol = { display: "flex", flexDirection: "column", gap: 10 };

const input = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #c7d2fe",
};

const btnGreen = {
  padding: 12,
  background: "linear-gradient(90deg,#22c55e,#16a34a)",
  color: "#fff",
  border: "none",
  borderRadius: 999,
  fontWeight: 700,
  cursor: "pointer",
};

const table = { width: "100%", borderCollapse: "collapse" };

const th = {
  background: "#f1f5f9",
  padding: 10,
  textAlign: "left",
};

const thGrad = {
  padding: 10,
  color: "#fff",
  background: "linear-gradient(90deg,#6366f1,#22d3ee)",
};

const td = { padding: 10, borderBottom: "1px solid #e5e7eb" };
const tdCenter = { ...td, textAlign: "center" };
const tdMono = { ...td, fontFamily: "monospace" };
const tdName = { ...td, fontWeight: 700 };

const searchRow = { display: "flex", gap: 10, marginBottom: 12 };

const loader = { padding: 12, textAlign: "center", color: "#475569" };
