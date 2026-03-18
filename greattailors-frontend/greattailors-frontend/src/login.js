import React, { useState } from "react";
import axios from "axios";


const api = axios.create({
  baseURL: "http://localhost:5000", 
  timeout: 5000,
});

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log("Submitting", form);
      const res = await api.post("/api/login", form);
      console.log("Response:", res.status, res.data);

      if (res.data && res.data.success) {
        setMessage("Login successful ✅");
        localStorage.setItem("token", res.data.token || "");
      } else {
        setMessage(res.data?.message || "Invalid credentials ❌");
      }
    } catch (err) {
      
      console.error("Login error (detailed):", err);

      if (err.response) {
        
        setMessage(
          `Server error: ${err.response.status} — ${err.response.data?.message || err.response.statusText}`
        );
      } else if (err.request) {
        
        setMessage(
          "Network error: no response from server (server down / wrong URL / CORS). See console Network tab."
        );
      } else {
        
        setMessage("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Login</h2>

        <label style={styles.label}>Username</label>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f5f5f5",
  },
  form: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  title: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  label: {
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  input: {
    padding: "0.6rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  button: {
    padding: "0.7rem",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  message: {
    marginTop: "0.5rem",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "red",
  },
};
