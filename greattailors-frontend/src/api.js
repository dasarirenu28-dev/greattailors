// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  timeout: 20000,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const s = err?.response?.status;
    if (s === 401 || s === 403) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/") window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default API;
