import React, { useEffect, useState } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import "./Customers.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [data, setData] = useState({
    shirtCount: 0,
    pantCount: 0,
    shirt: [],
    pant: [],
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/customer`);
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= OPEN MODAL ================= */
  const openModal = (cust) => {
    setSelectedCustomer(cust);
    setData({
      shirtCount: cust.measurements?.shirt?.length || 0,
      pantCount: cust.measurements?.pant?.length || 0,
      shirt: cust.measurements?.shirt || [],
      pant: cust.measurements?.pant || [],
    });
    setShowModal(true);
  };

  /* ================= HANDLE COUNT ================= */
  const handleCountChange = (e) => {
    const { name, value } = e.target;
    const count = Number(value);

    setData((prev) => ({
      ...prev,
      [`${name}Count`]: count,
      [name]: Array.from({ length: count }, (_, i) => prev[name][i] || ""),
    }));
  };

  /* ================= HANDLE VALUE ================= */
  const handleValueChange = (type, index, value) => {
    const arr = [...data[type]];
    arr[index] = value;
    setData((prev) => ({ ...prev, [type]: arr }));
  };

  /* ================= SAVE ================= */
  const saveMeasurements = async () => {
    try {
      await axios.put(
        `${API_BASE}/customer/${selectedCustomer._id}/measurements`,
        {
          measurements: {
            shirt: data.shirt,
            pant: data.pant,
          },
        }
      );

      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="customers-page">
      <h2>👥 Customers</h2>

      <table className="customers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Measurement (Double Click)</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td
                className="measurement-cell"
                onDoubleClick={() => openModal(c)}
                title="Double click to edit"
              >
                👕 {c.measurements?.shirt?.length || 0} &nbsp;|&nbsp;
                👖 {c.measurements?.pant?.length || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MODAL ================= */}
      {showModal &&
        createPortal(
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>
                Measurements – {selectedCustomer?.name}
              </h3>

              <div className="count-row">
                <input
                  name="shirt"
                  type="number"
                  min="0"
                  placeholder="Shirt count"
                  value={data.shirtCount}
                  onChange={handleCountChange}
                />
                <input
                  name="pant"
                  type="number"
                  min="0"
                  placeholder="Pant count"
                  value={data.pantCount}
                  onChange={handleCountChange}
                />
              </div>

              <h4>👕 Shirt Measurements</h4>
              <div className="grid">
                {data.shirt.map((v, i) => (
                  <input
                    key={i}
                    placeholder={`Shirt ${i + 1}`}
                    value={v}
                    onChange={(e) =>
                      handleValueChange("shirt", i, e.target.value)
                    }
                  />
                ))}
              </div>

              <h4>👖 Pant Measurements</h4>
              <div className="grid">
                {data.pant.map((v, i) => (
                  <input
                    key={i}
                    placeholder={`Pant ${i + 1}`}
                    value={v}
                    onChange={(e) =>
                      handleValueChange("pant", i, e.target.value)
                    }
                  />
                ))}
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-save"
                  onClick={saveMeasurements}
                >
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}


/* ================= STYLES ================= */

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "linear-gradient(135deg,#ecfeff,#fdf2f8)",
};

const title = { fontSize: 28, marginBottom: 16 };

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
};

const table = { width: "100%", borderCollapse: "collapse" };

const th = {
  padding: 12,
  background: "linear-gradient(90deg,#6366f1,#22d3ee)",
  color: "#fff",
  textAlign: "left",
};

const td = {
  padding: 12,
  borderBottom: "1px solid #e5e7eb",
};

const formRow = {
  display: "flex",
  gap: 12,
  marginBottom: 12,
};

const input = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
};

const measurementGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 10,
};

const btnAdd = {
  padding: "8px 18px",
  borderRadius: 999,
  background: "linear-gradient(90deg,#6366f1,#22d3ee)",
  color: "#fff",
  border: "none",
  fontWeight: 600,
  cursor: "pointer",
};

const btnCancel = {
  padding: "8px 16px",
  marginRight: 8,
  borderRadius: 999,
  border: "none",
  background: "#e5e7eb",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modal = {
  background: "#fff",
  padding: 24,
  width: "80%",
  maxHeight: "85vh",
  overflowY: "auto",
  borderRadius: 16,
};

const badge = (bg, color) => ({
  padding: "4px 10px",
  borderRadius: 999,
  background: bg,
  color,
  fontSize: 12,
  fontWeight: 600,
});

const badgePurple = badge("#ede9fe", "#6d28d9");
const badgeBlue = badge("#dbeafe", "#1e40af");
