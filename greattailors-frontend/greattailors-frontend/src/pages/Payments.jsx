import React, { useEffect, useState } from "react";
import API from "../api";

export default function PaymentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  async function loadPayments() {
    try {
      setErr("");
      setLoading(true);
      const { data } = await API.get("/payments");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  async function openInvoice(paymentId) {
    try {
      const res = await API.get(`/payments/${paymentId}/invoice`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  }

  const filtered = rows.filter((p) => {
    const text = `${p.customerName || ""} ${p.customerPhone || ""} ${
      p.method || ""
    }`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  if (loading) return <div style={{ padding: 24 }}>Loading payments…</div>;
  if (err) return <div style={errorBox}>{err}</div>;

  return (
    <div style={page}>
      {/* Header */}
      <div style={header}>
        <h2 style={title}>💰 Payments</h2>
        <div>
          <input
            placeholder="Search customer / phone / method…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={searchInput}
          />
          <button onClick={loadPayments} style={btnRefresh}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Order</th>
              <th style={th}>Customer</th>
              <th style={th}>Amount</th>
              <th style={th}>Method</th>
              <th style={th}>Paid At</th>
              <th style={th}>Invoice</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p, idx) => (
              <tr
                key={p.paymentId || p._id}
                style={{
                  background: idx % 2 === 0 ? "#f9fafb" : "#ffffff",
                }}
              >
                <td style={td}>
                  <span style={badgeBlue}>
                    {p.orderNumber || p.orderId || "—"}
                  </span>
                </td>

                <td style={td}>
                  <div style={{ fontWeight: 600 }}>
                    {p.customerName || "—"}
                  </div>
                  {p.customerPhone && (
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      📞 {p.customerPhone}
                    </div>
                  )}
                </td>

                <td style={td}>
                  <span style={badgeGreen}>
                    ₹{Number(p.amount || 0).toFixed(2)}
                  </span>
                </td>

                <td style={td}>
                  <span
                    style={
                      p.method === "UPI"
                        ? badgeTeal
                        : p.method === "CARD"
                        ? badgeIndigo
                        : badgeGray
                    }
                  >
                    {p.method || "—"}
                  </span>
                </td>

                <td style={td}>
                  {p.paidAt ? (
                    <span style={badgeAmber}>
                      {new Date(p.paidAt).toLocaleString()}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>

                <td style={td}>
                  {(p.paymentId || p._id) ? (
                    <button
                      onClick={() => openInvoice(p.paymentId || p._id)}
                      style={btnPdf}
                    >
                      📄 PDF
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...td, textAlign: "center" }}>
                  No payments found
                </td>
              </tr>
            )}
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
  background: "linear-gradient(135deg,#ecfeff,#fdf2f8)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};

const title = {
  fontSize: 28,
  color: "#0f172a",
};

const card = {
  background: "#ffffff",
  borderRadius: 18,
  padding: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  overflowX: "auto",
};

const searchInput = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  minWidth: 280,
  marginRight: 8,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  padding: "12px",
  background: "linear-gradient(90deg,#6366f1,#22d3ee)",
  color: "#fff",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  verticalAlign: "top",
};

const btnRefresh = {
  padding: "8px 14px",
  borderRadius: 20,
  background: "#22d3ee",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const btnPdf = {
  padding: "6px 14px",
  borderRadius: 999,
  background: "#a855f7",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

/* ===== Badges ===== */

const badge = (bg, color) => ({
  background: bg,
  color,
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  display: "inline-block",
});

const badgeGreen = badge("#dcfce7", "#166534");
const badgeBlue = badge("#dbeafe", "#1e40af");
const badgeIndigo = badge("#e0e7ff", "#3730a3");
const badgeTeal = badge("#ccfbf1", "#115e59");
const badgeAmber = badge("#fef3c7", "#92400e");
const badgeGray = badge("#f1f5f9", "#334155");

const errorBox = {
  padding: 16,
  background: "#fee2e2",
  color: "#7f1d1d",
  borderRadius: 12,
};
