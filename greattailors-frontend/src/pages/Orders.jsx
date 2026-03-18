import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "https://greattailors-backend.onrender.com/orders";

/* Services */
const SERVICES = ["Alteration", "New"];

const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "BANK"];
const DELIVERY_STATUS = ["Pending", "InProcess", "Completed", "Delivered"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [remainingPay, setRemainingPay] = useState({});

  /* ===== CREATE ORDER FORM ===== */
  const [form, setForm] = useState({
    customerId: "",
    deliveryDate: "",
    advancePaid: "",
    items: [{ itemName: "", service: "", quantity: 1, price: "" }],
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [o, c] = await Promise.all([
      axios.get(`${API_BASE}/orders`),
      axios.get(`${API_BASE}/customer`),
    ]);
    setOrders(o.data || []);
    setCustomers(c.data || []);
  }

  /* ===== HELPERS ===== */
  const calcTotal = (items = []) =>
    items.reduce(
      (sum, i) => sum + Number(i.quantity || 0) * Number(i.price || 0),
      0
    );

  const sumPayments = (payments = []) =>
    payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const clampPayAmount = (val, remaining) => {
    const n = Number(val || 0);
    if (n <= 0) return 0;
    if (n > remaining) return remaining;
    return n;
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN") : "-";

  function updateItem(idx, field, value) {
    const items = [...form.items];
    items[idx][field] = value;
    setForm({ ...form, items });
  }

  function addItem() {
    setForm({
      ...form,
      items: [
        ...form.items,
        { itemName: "", service: "", quantity: 1, price: "" },
      ],
    });
  }

  /* ===== CREATE ORDER ===== */
  async function createOrder(e) {
    e.preventDefault();

    await axios.post(`${API_BASE}/orders`, {
      customerId: form.customerId,
      deliveryDate: form.deliveryDate,
      advancePaid: Number(form.advancePaid || 0),
      items: form.items.map((i) => ({
        itemName: i.itemName,
        service: i.service,
        quantity: Number(i.quantity),
        price: Number(i.price),
      })),
    });

    setForm({
      customerId: "",
      deliveryDate: "",
      advancePaid: "",
      items: [{ itemName: "", service: "", quantity: 1, price: "" }],
    });

    loadAll();
  }

  /* ===== SAVE / PAY ORDER ===== */
  async function saveOrder(o) {
    const total = calcTotal(o.items);
    const paidTotal = sumPayments(o.payments);
    const remaining = total - paidTotal;

    if (remaining <= 0) {
      alert("This order is already fully paid");
      return;
    }

    const payInput = remainingPay[o._id];
    const payNow = clampPayAmount(payInput, remaining);

    if (payNow <= 0) {
      alert("Enter valid payment amount");
      return;
    }

    try {
      await axios.patch(`${API_BASE}/orders/${o._id}`, {
        paidNow: payNow,
        paymentMethod: o.paymentMethod,
        deliveryStatus: o.deliveryStatus,
        deliveryDate: o.deliveryDate,
      });

      setRemainingPay({ ...remainingPay, [o._id]: "" });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.error || "Payment failed");
    }
  }

  return (
    <div style={page}>
      <h1 style={title}>🧵 Orders</h1>

      {/* ================= CREATE ORDER ================= */}
      <div style={card}>
        <h3 style={cardTitle}>➕ Create Order</h3>

        <form onSubmit={createOrder}>
          <select
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            style={input}
            required
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.orderId})
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.deliveryDate}
            onChange={(e) =>
              setForm({ ...form, deliveryDate: e.target.value })
            }
            style={input}
          />

          {form.items.map((i, idx) => (
            <div key={idx} style={row}>
              <input
                placeholder="Item"
                value={i.itemName}
                onChange={(e) =>
                  updateItem(idx, "itemName", e.target.value)
                }
                style={input}
              />

              <select
                value={i.service}
                onChange={(e) =>
                  updateItem(idx, "service", e.target.value)
                }
                style={input}
                required
              >
                <option value="">Service</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Qty"
                value={i.quantity}
                onChange={(e) =>
                  updateItem(idx, "quantity", e.target.value)
                }
                style={inputSmall}
              />

              <input
                placeholder="Unit Price"
                value={i.price}
                onChange={(e) => updateItem(idx, "price", e.target.value)}
                style={inputSmall}
              />
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <b>Total: ₹{calcTotal(form.items)}</b>
          </div>

          <input
            placeholder="Advance Paid"
            value={form.advancePaid}
            onChange={(e) =>
              setForm({ ...form, advancePaid: e.target.value })
            }
            style={inputSmall}
          />

          <div style={{ marginTop: 10 }}>
            <button type="button" style={btnGray} onClick={addItem}>
              + Add Item
            </button>
            <button style={btnGreen}>Create Order</button>
          </div>
        </form>
      </div>

      {/* ================= ORDERS TABLE ================= */}
      <div style={{ ...card, marginTop: 24 }}>
        <table style={table}>
          <thead>
            <tr>
              {[
                "Order ID",
                "Customer",
                "Order Date",
                "Delivery Date",
                "Item - Service",
                "Qty",
                "Unit Price",
                "Total",
                "Paid",
                "Payment History",
                "Remaining",
                "Status",
                "Method",
                "Delivery",
                "Pay",
                "Action",
              ].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => {
              const total = calcTotal(o.items);
              const paidTotal = sumPayments(o.payments);
              const remaining = total - paidTotal;

              return (
                <tr key={o._id}>
                  <td>{o.customerId?.orderId}</td>
                  <td>{o.customerId?.name}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{formatDate(o.deliveryDate)}</td>

                  <td>
                    {o.items.map((i, x) => (
                      <div key={x}>
                        {i.itemName} - {i.service}
                      </div>
                    ))}
                  </td>

                  <td>
                    {o.items.map((i, x) => (
                      <div key={x}>{i.quantity}</div>
                    ))}
                  </td>

                  <td>
                    {o.items.map((i, x) => (
                      <div key={x}>₹{i.price}</div>
                    ))}
                  </td>

                  <td>₹{total}</td>
                  <td>₹{paidTotal}</td>

                  <td>
                    {o.payments?.map((p, i) => (
                      <div key={i}>
                        {i + 1}) ₹{p.amount} - {p.method}
                      </div>
                    ))}
                  </td>

                  <td>₹{remaining}</td>
                  <td>{o.paymentStatus}</td>

                  <td>
                    <select
                      value={o.paymentMethod}
                      onChange={(e) => {
                        o.paymentMethod = e.target.value;
                        setOrders([...orders]);
                      }}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <select
                      value={o.deliveryStatus}
                      onChange={(e) => {
                        o.deliveryStatus = e.target.value;
                        setOrders([...orders]);
                      }}
                    >
                      {DELIVERY_STATUS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      placeholder="Pay"
                      disabled={remaining <= 0}
                      value={remainingPay[o._id] || ""}
                      onChange={(e) =>
                        setRemainingPay({
                          ...remainingPay,
                          [o._id]: e.target.value,
                        })
                      }
                      style={{
                        ...inputSmall,
                        background: remaining <= 0 ? "#e5e7eb" : "#fff",
                      }}
                    />
                  </td>

                  <td>
                    <button
                      style={btnGreen}
                      disabled={remaining <= 0}
                      onClick={() => saveOrder(o)}
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

/* ===== STYLES ===== */
const page = { padding: 24 };
const title = { fontSize: 28, fontWeight: 800 };
const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,.1)",
};
const cardTitle = { marginBottom: 12, fontSize: 18 };
const row = { display: "flex", gap: 8, marginBottom: 6 };
const table = { width: "100%", borderCollapse: "collapse" };
const th = {
  background: "linear-gradient(90deg,#6366f1,#22d3ee)",
  color: "#fff",
  padding: 10,
};
const input = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid #c7d2fe",
};
const inputSmall = { ...input, width: 90 };
const btnGreen = {
  padding: "6px 14px",
  borderRadius: 999,
  background: "linear-gradient(90deg,#22c55e,#16a34a)",
  color: "#fff",
  border: "none",
};
const btnGray = {
  padding: "6px 14px",
  borderRadius: 999,
  background: "#e5e7eb",
  border: "none",
};
