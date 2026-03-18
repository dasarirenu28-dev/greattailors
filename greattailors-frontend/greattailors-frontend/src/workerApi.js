// src/api/workerApi.js
import axios from "axios";
const BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

async function getData(p) {
  try {
    const res = await axios.get(p);
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err?.response?.data || err.message;
    throw new Error(msg || "Network error");
  }
}

export async function getWorkers() {
  // try both paths to avoid mount mismatch
  try {
    return await getData(`${BASE}/workers`);
  } catch (e1) {
    // try /api/workers fallback
    return await getData(`${BASE}/api/workers`);
  }
}

export const createWorker = (payload) => axios.post(`${BASE}/workers`, payload).then(r => r.data);
export const updateWorker = (id, payload) => axios.put(`${BASE}/workers/${id}`, payload).then(r => r.data);
export const deleteWorker = (id) => axios.delete(`${BASE}/workers/${id}`).then(r => r.data);
