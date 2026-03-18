// src/api/workerApi.js
import axios from "axios";

const BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
// You told me Postman works at: http://localhost:5000/workers
const WORKERS_URL = `${BASE}/workers`;

/**
 * helper to get auth headers if a token exists in localStorage
 */
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Standardized handler that throws a nice Error with server message
 */
async function handle(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    // prefer server-provided message if available
    const serverMsg =
      err?.response?.data?.message ||
      (typeof err?.response?.data === "string" ? err.response.data : null);
    const status = err?.response?.status;
    const msg = serverMsg || err.message || "Network error";
    const e = new Error(msg);
    e.status = status;
    throw e;
  }
}

/* Public API */
export const getWorkers = () => {
  // call the exact working URL you provided
  return handle(axios.get(WORKERS_URL, { headers: authHeaders() }));
};

export const createWorker = (payload) =>
  handle(axios.post(WORKERS_URL, payload, { headers: authHeaders() }));

export const updateWorker = (id, payload) =>
  handle(axios.put(`${WORKERS_URL}/${id}`, payload, { headers: authHeaders() }));

export const deleteWorker = (id) =>
  handle(axios.delete(`${WORKERS_URL}/${id}`, { headers: authHeaders() }));
