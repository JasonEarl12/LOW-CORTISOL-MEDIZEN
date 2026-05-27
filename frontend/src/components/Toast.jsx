import React, { useState, useEffect } from "react";
import "./Toast.css";

function Toast({ message, type = "info", duration = 3000, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {type === "success" && <span className="toast-icon">✓</span>}
        {type === "error" && <span className="toast-icon">✕</span>}
        {type === "info" && <span className="toast-icon">ℹ</span>}
        <span>{message}</span>
      </div>
    </div>
  );
}

export default Toast;
