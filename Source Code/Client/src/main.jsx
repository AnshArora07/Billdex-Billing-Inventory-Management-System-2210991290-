import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { checkBackendHealth } from "./utils/health.js";
import "./index.css";

// Check backend health on startup
console.log("🚀 Billdex starting up...");
checkBackendHealth();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
