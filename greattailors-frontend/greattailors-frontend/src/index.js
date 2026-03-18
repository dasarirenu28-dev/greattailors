// src/index.js
// Tip: while testing, you can force login page on refresh by uncommenting this:
// localStorage.removeItem("token");

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
