// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        // try to fetch real data; on failure use demoSummary
        const { data } = await API.get("/dashboard/summary");
        const safe = {
          ...demoSummary,
          ...data,
          attendancePerSubject: data?.attendancePerSubject || demoSummary.attendancePerSubject,
          overviewPie: data?.overviewPie || demoSummary.overviewPie,
        };
        setSummary(safe);
      } catch (e) {
        console.warn("Dashboard API failed, using demo data:", e?.message || e);
        setErr(""); // don't show API error to users; we fallback to demo
        setSummary(demoSummary);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // logout helper
  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, Poppins, sans-serif" }}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <div style={{ padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            GT
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700 }}>Admin</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>kumar_admin</div>
          </div>
        </div>

        <nav style={{ marginTop: 10 }}>
          <NavItem to="/app/dashboard" label="Home" />
          <NavItem to="/app/update-profile" label="Update Profile" />
          <NavItem to="/app/course" label="Course" />
          <NavItem to="/app/subject" label="Subject" />
          <NavItem to="/app/session" label="Session" />
          <NavItem to="/app/add-staff" label="Add Staff" />
          <NavItem to="/app/manage-student" label="Manage Student" />
        </nav>

        <div style={{ marginTop: "auto", padding: 16 }}>
          <button onClick={logout} style={{ width: "100%", padding: 10, borderRadius: 8, border: "none", cursor: "pointer", background: "#fff" }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, background: "#f6f7fb" }}>
        {/* Top header */}
        <header style={header}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>College Management System</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: "#666" }}>{new Date().toLocaleString()}</div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: 20 }}>
          <h2 style={{ margin: "6px 0 18px 0" }}>
            <span style={{ fontSize: 18, marginRight: 8 }}>📋</span>
            Dashboard
          </h2>

          {loading && <div>Loading…</div>}

          {summary && (
            <>
              {/* stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 14 }}>
                <BigCard color="#ef4444" title="Total Students" value={summary.totalStudents} help="More info" />
                <BigCard color="#3b82f6" title="Total Staff" value={summary.totalStaff} help="More info" />
                <BigCard color="#10b981" title="Total Course" value={summary.totalCourses} help="More info" />
                <BigCard color="#ec4899" title="Total Subjects" value={summary.totalSubjects} help="More info" />
              </div>

              {/* charts row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 14, marginTop: 16 }}>
                <div style={panel}>
                  <div style={panelHeader}>
                    <strong>Attendance Per Subject</strong>
                    <button style={panelClose}>✕</button>
                  </div>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={summary.attendancePerSubject || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="attendance" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={panel}>
                  <div style={panelHeader}>
                    <strong>Staffs - Students Overview</strong>
                    <button style={panelClose}>✕</button>
                  </div>
                  <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={summary.overviewPie || []} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                          {(summary.overviewPie || []).map((entry, idx) => (
                            <Cell key={`c-${idx}`} fill={pieColors[idx % pieColors.length]} />
                          ))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36} />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* lower row: placeholder boxes */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                <div style={panel}>
                  <div style={panelHeader}><strong>Recent Students</strong></div>
                  <ul style={{ paddingLeft: 18 }}>
                    {(summary.recentStudents || demoSummary.recentStudents).map((s, i) => (
                      <li key={i} style={{ padding: "6px 0" }}>{s.name} — <small style={{ color: "#666" }}>{s.course}</small></li>
                    ))}
                  </ul>
                </div>

                <div style={panel}>
                  <div style={panelHeader}><strong>Upcoming Events</strong></div>
                  <ul style={{ paddingLeft: 18 }}>
                    {(summary.upcomingSessions || demoSummary.upcomingSessions).map((s, i) => (
                      <li key={i} style={{ padding: "6px 0" }}>{s.course} — <small style={{ color: "#666" }}>{s.date}</small></li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {err && <div style={{ color: "#d00", marginTop: 12 }}>{err}</div>}
        </main>
      </div>
    </div>
  );
}

/* ---------- small subcomponents & styles ---------- */

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "block",
        padding: "10px 16px",
        color: isActive ? "#fff" : "rgba(255,255,255,0.9)",
        background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
        textDecoration: "none",
      })}
    >
      {label}
    </NavLink>
  );
}

function BigCard({ color = "#4f46e5", title, value, help }) {
  return (
    <div style={{ background: "#fff", padding: 18, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 6px 20px rgba(2,6,23,0.04)" }}>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ background: color, color: "#fff", padding: "8px 10px", borderRadius: 6 }}>{help}</div>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */
const sidebar = {
  width: 220,
  background: "#1f2047",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
};

const header = {
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 20px",
  background: "#fff",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
};

const panel = {
  background: "#fff",
  borderRadius: 8,
  padding: 12,
  boxShadow: "0 12px 30px rgba(2,6,23,0.06)",
};

const panelHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};

const panelClose = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 14,
  color: "#999",
};

const pieColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

const demoSummary = {
  totalStudents: 120,
  totalStaff: 18,
  totalCourses: 6,
  totalSubjects: 22,
  attendancePerSubject: [
    { subject: "Math", attendance: 180 },
    { subject: "Science", attendance: 120 },
    { subject: "Java", attendance: 95 },
    { subject: "Python", attendance: 110 },
  ],
  overviewPie: [
    { name: "Students", value: 120 },
    { name: "Staff", value: 18 },
  ],
  recentStudents: [
    { name: "Asha Kumar", course: "BSc Math" },
    { name: "Ravi Patel", course: "BCA" },
    { name: "Sana Ali", course: "Diploma Fashion" },
  ],
  upcomingSessions: [
    { course: "Math - Batch A", date: "2025-10-10" },
    { course: "Python - Batch B", date: "2025-10-12" },
  ],
};
