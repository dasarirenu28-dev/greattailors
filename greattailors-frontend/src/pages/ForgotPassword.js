// src/pages/ForgotPassword.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ForgotPassword page (username + new password).
 * NOTE: This file expects a backend endpoint that updates password:
 *   POST http://localhost:5000/auth/reset-password
 * with JSON: { username, password }
 *
 * If your backend currently only has /auth/register (for creating users),
 * you'll need to add a reset endpoint on the server.
 */

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Primary reset endpoint we will call
  const RESET_API = "http://localhost:5000/auth/reset-password";

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    // client validation
    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("Please fill both password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = { username: username.trim(), password: newPassword };
      console.log("Request payload:", payload);

      const resp = await fetch(RESET_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await resp.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { rawText: text };
      }

      console.log("Reset response status:", resp.status, "body:", data);

      if (!resp.ok) {
        // Surface server message if present
        const serverMsg = data?.message || data?.error || data?.rawText || `HTTP ${resp.status}`;

        // Helpful handling for the exact problem you reported:
        if (typeof serverMsg === "string" && serverMsg.toLowerCase().includes("admin already exists")) {
          // This implies the backend route is still a registration endpoint.
          // Show user-friendly instruction for developers/admin.
          setError(
            "Server responded: 'Admin already exists'.\n" +
              "This happens because you're calling the registration endpoint (create user) instead of a password-reset endpoint.\n" +
              "Please add a proper reset endpoint (e.g. POST /auth/reset-password) on the backend that updates the existing user's password."
          );
        } else {
          setError(serverMsg);
        }
        return;
      }

      // success
      setInfo(data?.message || "Password updated successfully.");
      // redirect to login after short pause
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Reset error:", err);
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", fontFamily: "Inter, Poppins, sans-serif" }}>
      {/* Left: logo */}
      <div
        style={{
          flex: 1,
          backgroundImage: "url('/GreatTailors.jpg')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "#fff",
        }}
      />

      {/* Right: form */}
      <div style={{ width: 520, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h2 style={{ margin: "0 0 20px 0" }}>Reset Password</h2>
          <p style={{ margin: "0 0 18px 0", color: "#666" }}>Enter your username and a new password below.</p>

          {error && (
            <div style={{ color: "#b91c1c", background: "#fff1f2", padding: 10, borderRadius: 8, marginBottom: 14, whiteSpace: "pre-wrap" }}>
              {error}
            </div>
          )}

          {info && (
            <div style={{ color: "#155724", background: "#d4edda", padding: 10, borderRadius: 8, marginBottom: 14 }}>
              {info}
            </div>
          )}

          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #e5e7eb", borderRadius: 8 }}
              />
            </div>

            <div style={{ marginBottom: 18, position: "relative" }}>
              <label style={{ display: "block", marginBottom: 6 }}>Input new Password</label>
              <input
                type={show1 ? "text" : "password"}
                placeholder="Input new Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: "100%", padding: "16px 48px 16px 18px", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 16 }}
              />
              <button type="button" onClick={() => setShow1((s) => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}>
                {show1 ? "🙈" : "👁️"}
              </button>
            </div>

            <div style={{ marginBottom: 26, position: "relative" }}>
              <label style={{ display: "block", marginBottom: 6 }}>Confirm new Password</label>
              <input
                type={show2 ? "text" : "password"}
                placeholder="Confirm new Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: "100%", padding: "16px 48px 16px 18px", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 16 }}
              />
              <button type="button" onClick={() => setShow2((s) => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}>
                {show2 ? "🙈" : "👁️"}
              </button>
            </div>

            <div style={{ textAlign: "center" }}>
              <button type="submit" disabled={loading} style={{ width: "100%", padding: "16px 20px", background: "#e58a33", color: "#fff", border: "none", borderRadius: 30, fontWeight: 700, fontSize: 18, boxShadow: "0 8px 18px rgba(0,0,0,0.14)", cursor: "pointer" }}>
                {loading ? "Saving..." : "Reset Password"}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 18, textAlign: "center" }}>
            <button onClick={() => navigate("/login")} style={{ background: "transparent", border: "none", color: "#555", textDecoration: "underline", cursor: "pointer", fontSize: 14 }}>
              Back to Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
