import React, { useEffect, useState } from "react";
import axios from "axios";

const API =
  process.env.REACT_APP_API_BASE || "https://greattailors-backend.onrender.com";

const PAYMENT_METHODS = ["CASH", "BANK", "UPI", "CARD"];

export default function Warehouse() {
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [payAmt, setPayAmt] = useState({});
  const [payMode, setPayMode] = useState({});

  const [form, setForm] = useState({
    vendor: "",
    invoiceNumber: "",
    items: [{ productName: "", quantity: 1, price: "" }],
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [v, p] = await Promise.all([
      axios.get(`${API}/vendors`),
      axios.get(`${API}/warehouse-purchases`),
    ]);
    setVendors(v.data || []);
    setPurchases(p.data || []);
  }

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB") : "—";

  const calcTotal = (items) =>
    items.reduce(
      (s, i) => s + Number(i.quantity || 0) * Number(i.price || 0),
      0
    );

  function addItem() {
    setForm({
      ...form,
      items: [
        ...form.items,
        { productName: "", quantity: 1, price: "" },
      ],
    });
  }

  async function createPurchase(e) {
    e.preventDefault();
    await axios.post(`${API}/warehouse-purchases`, form);

    setForm({
      vendor: "",
      invoiceNumber: "",
      items: [{ productName: "", quantity: 1, price: "" }],
    });

    loadAll();
  }

  async function payVendor(p) {
    const amt = Number(payAmt[p._id] || 0);
    const mode = payMode[p._id] || "BANK";

    if (!amt || amt <= 0) {
      alert("Enter valid amount");
      return;
    }

    await axios.post(
      `${API}/warehouse-purchases/${p._id}/pay`,
      { amount: amt, method: mode }
    );

    setPayAmt({ ...payAmt, [p._id]: "" });
    setPayMode({ ...payMode, [p._id]: "BANK" });

    loadAll();
  }

  const modeColor = (m) =>
    m === "UPI"
      ? "#22c55e"
      : m === "CARD"
      ? "#f97316"
      : m === "CASH"
      ? "#eab308"
      : "#3b82f6";

  return (
    <div style={page}>
      <h1 style={title}>📦 Warehouse Purchases</h1>

      {/* CREATE PURCHASE */}
      <div style={card}>
        <h3 style={cardTitle}>➕ Create Purchase</h3>

        <form onSubmit={createPurchase}>
          <div style={row}>
            <select
              value={form.vendor}
              onChange={(e) =>
                setForm({ ...form, vendor: e.target.value })
              }
              style={input}
              required
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Invoice Number"
              value={form.invoiceNumber}
              onChange={(e) =>
                setForm({ ...form, invoiceNumber: e.target.value })
              }
              style={input}
              required
            />
          </div>

          {form.items.map((i, idx) => (
            <div key={idx} style={row}>
              <input
                placeholder="Product"
                value={i.productName}
                onChange={(e) => {
                  const items = [...form.items];
                  items[idx].productName = e.target.value;
                  setForm({ ...form, items });
                }}
                style={input}
              />
              <input
                type="number"
                value={i.quantity}
                onChange={(e) => {
                  const items = [...form.items];
                  items[idx].quantity = e.target.value;
                  setForm({ ...form, items });
                }}
                style={inputSmall}
              />
              <input
                placeholder="Price"
                value={i.price}
                onChange={(e) => {
                  const items = [...form.items];
                  items[idx].price = e.target.value;
                  setForm({ ...form, items });
                }}
                style={inputSmall}
              />
            </div>
          ))}

          <p style={{ fontWeight: 700 }}>
            Total: ₹{calcTotal(form.items)}
          </p>

          <button type="button" onClick={addItem} style={btnOutline}>
            + Add Item
          </button>
          <button style={btnPrimary}>Create Purchase</button>
        </form>
      </div>

      {/* PURCHASE LIST */}
      <div style={{ ...card, marginTop: 24 }}>
        <h3 style={cardTitle}>📄 Purchase List</h3>

        <table style={table}>
          <thead>
            <tr>
              {[
                "Invoice",
                "Vendor",
                "Items",
                "Created",
                "Total",
                "Paid",
                "Remaining",
                "Status",
                "Payment History",
                "Pay",
                "Mode",
                "Action",
              ].map((h) => (
                <th key={h} style={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {purchases.map((p) => {
              const remaining =
                p.totalAmount - p.paidAmount;

              return (
                <tr key={p._id}>
                  <td style={tdMono}>{p.invoiceNumber}</td>
                  <td style={tdStrong}>{p.vendor?.name}</td>

                  <td>
                    {p.items.map((i, idx) => (
                      <div key={idx}>
                        {i.productName} | Qty {i.quantity} | ₹
                        {i.price}
                      </div>
                    ))}
                  </td>

                  <td>{fmtDate(p.createdAt)}</td>
                  <td>₹{p.totalAmount}</td>
                  <td style={{ color: "#16a34a" }}>
                    ₹{p.paidAmount}
                  </td>
                  <td style={{ color: "#dc2626" }}>
                    ₹{remaining}
                  </td>

                  <td>
                    <span
                      style={{
                        ...badge,
                        background:
                          p.paymentStatus === "Paid"
                            ? "#dcfce7"
                            : "#fef3c7",
                      }}
                    >
                      {p.paymentStatus}
                    </span>
                  </td>

                  <td>
                    {p.payments?.length
                      ? p.payments.map((x, i) => (
                          <div key={i}>
                            {i + 1}) ₹{x.amount} –{" "}
                            <span
                              style={{
                                color: modeColor(x.method),
                                fontWeight: 700,
                              }}
                            >
                              {x.method}
                            </span>{" "}
                            – {fmtDate(x.paidAt)}
                          </div>
                        ))
                      : "—"}
                  </td>

                  <td>
                    <input
                      placeholder="Pay"
                      style={inputSmall}
                      value={payAmt[p._id] || ""}
                      onChange={(e) =>
                        setPayAmt({
                          ...payAmt,
                          [p._id]: e.target.value,
                        })
                      }
                    />
                  </td>

                  <td>
                    <select
                      style={inputSmall}
                      value={payMode[p._id] || "BANK"}
                      onChange={(e) =>
                        setPayMode({
                          ...payMode,
                          [p._id]: e.target.value,
                        })
                      }
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <button
                      style={btnSave}
                      onClick={() => payVendor(p)}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
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
  marginBottom: 16,
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,.08)",
};

const cardTitle = {
  marginBottom: 12,
  fontSize: 18,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  background:
    "linear-gradient(90deg,#6366f1,#22d3ee)",
  color: "#fff",
  padding: 10,
};

const tdMono = {
  padding: 10,
  fontFamily: "monospace",
};

const tdStrong = {
  padding: 10,
  fontWeight: 700,
};

const badge = {
  padding: "4px 10px",
  borderRadius: 999,
  fontWeight: 700,
};

const row = {
  display: "flex",
  gap: 10,
  marginBottom: 8,
};

const input = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid #c7d2fe",
  flex: 1,
};

const inputSmall = {
  ...input,
  width: 90,
};

const btnPrimary = {
  marginLeft: 10,
  padding: "8px 16px",
  border: "none",
  borderRadius: 999,
  background:
    "linear-gradient(90deg,#4f46e5,#06b6d4)",
  color: "#fff",
  fontWeight: 700,
};

const btnOutline = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid #6366f1",
  background: "#fff",
  color: "#4f46e5",
  fontWeight: 600,
};

const btnSave = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "none",
  background: "#22c55e",
  color: "#fff",
  fontWeight: 700,
};
