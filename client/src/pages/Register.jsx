import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

export default function Register() {
  const [username, setUsername] = useState("");   // REQUIRED
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !email || !pass) {
      return alert("Please fill all fields");
    }

    try {
      const res = await axios.post("http://localhost:4000/auth/register", {
        username,              // 🔥 MUST BE SENT
        email,
        password: pass,
      });

      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="auth-container-dark">
      <div className="auth-box">
        <h2>Create Account</h2>

        <input
          className="auth-input"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="auth-input"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Enter password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <button className="auth-btn" onClick={handleRegister}>
          Register
        </button>

        <p className="auth-bottom-text">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
