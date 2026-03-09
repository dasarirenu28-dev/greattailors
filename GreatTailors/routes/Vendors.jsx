import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

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
      <h2>🏭 Vendors</h2>

      <div style={card}>
        <h4>Add Vendor</h4>
        <form onSubmit={createVendor} style={formRow}>
          <input
            placeholder="Vendor Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <button>Add</button>
        </form>
      </div>

      <div style={card}>
        <h4>Vendor List</h4>
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v._id}>
                <td>{v.name}</td>
                <td>{v.phone || "—"}</td>
                <td>{v.address || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Styles */
const page = { padding: 20 };
const card = {
  background: "#fff",
  padding: 16,
  marginBottom: 20,
  borderRadius: 10,
};
const formRow = { display: "flex", gap: 8 };
