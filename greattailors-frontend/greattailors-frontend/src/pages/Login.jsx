// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      // window.location.href = "/app/dashboard";
            navigate("/app/dashboard", { replace: true });

    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src={`${process.env.PUBLIC_URL}/logo.jpg`}   // ✅ from /public
            alt="Great Tailors Logo"
            style={{ width: 150, height: 110, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }}
            onError={(e) => {
              e.currentTarget.style.border = "2px solid red";
              e.currentTarget.alt = "logo.jpg not found in /public";
            }}
          />
          <h2 style={{ marginTop: 10 }}>Great Tailors</h2>
        </div>

        <input type="email" placeholder="Email" value={email}
               onChange={(e)=>setEmail(e.target.value)} style={input}/>
        <input type="password" placeholder="Password" value={password}
               onChange={(e)=>setPassword(e.target.value)} style={input}/>
        <button onClick={handleLogin} style={btn}>Login</button>
      </div>
    </div>
  );
}

const wrap = { display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", background:"#f5f5f5" };
const card = { width:340, background:"#fff", padding:24, borderRadius:8, boxShadow:"0 2px 8px rgba(0,0,0,0.2)" };
const input = { width:"100%", padding:10, marginBottom:10, border:"1px solid #ccc", borderRadius:6 };
const btn = { width:"100%", padding:10, background:"#4f46e5", color:"#fff", border:"none", borderRadius:6, cursor:"pointer" };
