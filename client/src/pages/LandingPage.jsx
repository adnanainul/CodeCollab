import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

export default function LandingPage() {
  return (
    <div className="landing-container">
      <h1 className="landing-title">⚡ CodeCollab</h1>

      <p className="landing-subtitle">
        Real-Time Collaborative Code Editor with Live Cursor Sync,
        Chat & Code Execution.
      </p>

      <div className="landing-buttons">
        <Link to="/login" className="landing-btn login-btn">
          Login
        </Link>

        <Link to="/register" className="landing-btn register-btn">
          Register
        </Link>

        <Link to="/editor" className="landing-btn start-btn">
          Start Coding →
        </Link>
      </div>
    </div>
  );
}
