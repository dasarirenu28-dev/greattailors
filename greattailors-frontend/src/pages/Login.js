import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api"; // keep or stub as needed

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // adapt to your backend
      const { data } = await API.post("/auth/login", { username, password });
      if (!data?.token) throw new Error("No token from server");
      localStorage.setItem("token", data.token);
      navigate("/app/dashboard");
    } catch (e) {
      setErr(e?.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        backgroundImage:
          "", // put background in public/tailor-bg.jpg
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, Poppins, sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: 360,
          backgroundColor: "rgba(255,255,255,0.98)",
          borderRadius: 8,
          padding: 28,
          boxShadow: "0 8px 25px rgba(0,0,0,0.22)",
          textAlign: "center",
        }}
      >
        <img
          src="/GreatTailors.jpg" // put logo in public/GreatTailors.jpg
          alt="Great Tailors Logo"
          style={{
            width: 120,
            height: 120,
            objectFit: "contain",
            marginBottom: 10,
          }}
        />

        <div
          style={{
            color: "#c0262e",
            fontWeight: 600,
            fontSize: "1rem",
            marginBottom: 12,
          }}
        >
          Great Tailors
        </div>

        {err && (
          <div
            style={{
              color: "#b91c1c",
              marginBottom: 12,
              fontSize: "0.92rem",
            }}
          >
            {err}
          </div>
        )}

        <div style={{ marginBottom: 12, textAlign: "left" }}>
          <input
            type="text"
            placeholder="Your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>

        <div style={{ marginBottom: 16, textAlign: "left" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#0ea5a4",
              color: "#fff",
              padding: "10px 26px",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            style={{
              background: "transparent",
              border: "none",
              color: "#333",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}
