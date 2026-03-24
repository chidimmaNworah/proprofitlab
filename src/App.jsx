import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import "./App.css";
import Dashboard from "./Dashboard";
import DrTracker from "./DrTracker";
import AlgoLead from "./AlgoLead";

function App() {
  const location = useLocation();
  const [dashAuth, setDashAuth] = useState(false);
  const [dashCreds, setDashCreds] = useState({ username: "", password: "" });
  const [dashError, setDashError] = useState("");
  const [dashLoading, setDashLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDashLogin = async (e) => {
    e.preventDefault();
    setDashLoading(true);
    setDashError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dashCreds),
      });
      const data = await res.json();
      if (data.success) {
        setDashAuth(true);
      } else {
        setDashError(data.error || "Invalid credentials.");
      }
    } catch {
      setDashError("Server error.");
    }
    setDashLoading(false);
  };

  const isActive = (path) => {
    if (path === "/algolead") {
      return location.pathname === "/" || location.pathname === "/algolead";
    }
    return location.pathname === path;
  };

  return (
    <div className="app-wrapper">
      <nav className="top-nav">
        <span className="brand">ProProfitLab</span>
        <Link
          to="/algolead"
          className={`nav-btn ${isActive("/algolead") ? "active" : ""}`}
        >
          AlgoLead
        </Link>
        <Link
          to="/drtracker"
          className={`nav-btn ${isActive("/drtracker") ? "active" : ""}`}
        >
          Dr Tracker
        </Link>
        <Link
          to="/dashboard"
          className={`nav-btn ${isActive("/dashboard") ? "active" : ""}`}
        >
          Dashboard
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<AlgoLead />} />
        <Route path="/algolead" element={<AlgoLead />} />
        <Route path="/drtracker" element={<DrTracker />} />
        <Route
          path="/dashboard"
          element={
            dashAuth ? (
              <Dashboard
                onLogout={() => {
                  setDashAuth(false);
                  setDashCreds({ username: "", password: "" });
                }}
              />
            ) : (
              <div className="form-container">
                <h1>Dashboard Login</h1>
                <p className="form-subtitle">
                  Enter credentials to access the dashboard.
                </p>
                <form onSubmit={handleDashLogin} className="algo-form">
                  <input
                    placeholder="Username"
                    value={dashCreds.username}
                    onChange={(e) =>
                      setDashCreds({ ...dashCreds, username: e.target.value })
                    }
                    required
                  />
                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={dashCreds.password}
                      onChange={(e) =>
                        setDashCreds({ ...dashCreds, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="toggle-pw"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={dashLoading}
                  >
                    {dashLoading ? "Logging in..." : "Login"}
                  </button>
                  {dashError && <div className="error">{dashError}</div>}
                </form>
              </div>
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
