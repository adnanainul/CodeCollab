import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ level: '', width: 0 });
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength({ level: 'weak', width: 33 });
    } else if (password.length < 10) {
      setPasswordStrength({ level: 'medium', width: 66 });
    } else {
      setPasswordStrength({ level: 'strong', width: 100 });
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPass(value);
    if (value) {
      checkPasswordStrength(value);
    } else {
      setPasswordStrength({ level: '', width: 0 });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !pass) {
      setError("Please fill all fields");
      return;
    }

    if (pass.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
      const res = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password: pass,
      });

      
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Server error");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container-dark">
      <div className="auth-box">
        <h2>Create Account</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <input
            className="auth-input"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />

          <input
            className="auth-input"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <div className="password-wrapper">
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password (min 6 characters)"
              value={pass}
              onChange={handlePasswordChange}
              disabled={loading}
              style={{ paddingRight: '45px' }}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {passwordStrength.level && (
            <div className="password-strength">
              <div
                className={`password-strength-bar ${passwordStrength.level}`}
                style={{ width: `${passwordStrength.width}%` }}
              />
            </div>
          )}

          <button
            className={`auth-btn ${loading ? 'loading' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? '' : 'Create Account'}
          </button>
        </form>

        <p className="auth-bottom-text">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
