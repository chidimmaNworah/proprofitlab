import { useState, useEffect } from "react";
import "./App.css";
import Dashboard from "./Dashboard";

const countryPhoneToISO = {
  "+64": "NZ",
  "+1": "US",
  "+61": "AU",
  "+65": "SG",
  "+44": "GB",
  "+353": "IE",
  "+45": "DK",
  "+46": "SE",
  "+358": "FI",
  "+31": "NL",
  "+49": "DE",
  "+43": "AT",
  "+39": "IT",
  "+34": "ES",
  "+33": "FR",
  "+351": "PT",
  "+48": "PL",
  "+47": "NO",
  "+32": "BE",
  "+41": "CH",
  "+30": "GR",
  "+36": "HU",
  "+40": "RO",
  "+90": "TR",
  "+55": "BR",
  "+52": "MX",
  "+91": "IN",
  "+81": "JP",
  "+82": "KR",
  "+86": "CN",
  "+7": "RU",
  "+420": "CZ",
  "+421": "SK",
  "+385": "HR",
  "+386": "SI",
  "+372": "EE",
  "+371": "LV",
  "+370": "LT",
  "+356": "MT",
  "+357": "CY",
  "+60": "MY",
  "+66": "TH",
  "+63": "PH",
  "+62": "ID",
  "+27": "ZA",
  "+234": "NG",
  "+254": "KE",
  "+20": "EG",
  "+971": "AE",
  "+966": "SA",
};

function generateClickId() {
  const len = Math.floor(Math.random() * 7) + 9;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < len; i++)
    result += chars[Math.floor(Math.random() * chars.length)];
  return `clickid_${result}`;
}

function generatePassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const all = upper + lower + digits;
  let pw =
    upper[Math.floor(Math.random() * 26)] +
    lower[Math.floor(Math.random() * 26)] +
    digits[Math.floor(Math.random() * 10)];
  for (let i = 0; i < 5 + Math.floor(Math.random() * 4); i++) {
    pw += all[Math.floor(Math.random() * all.length)];
  }
  return pw
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function App() {
  const [form, setForm] = useState({
    FirstName: "",
    LastName: "",
    LoginEmail: "",
    PhonePrefix: "",
    Phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [clickId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    let cid = params.get("clickid");
    if (!cid) {
      cid = generateClickId();
      params.set("clickid", cid);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params}`,
      );
    }
    return cid;
  });

  const [dashAuth, setDashAuth] = useState(false);
  const [dashCreds, setDashCreds] = useState({ username: "", password: "" });
  const [dashError, setDashError] = useState("");
  const [dashLoading, setDashLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Detect country
    fetch("https://geinfoinfo.mrtinaixii.workers.dev/")
      .then((r) => r.text())
      .then((code) => {
        setCountryCode(code.trim());
      })
      .catch(() => {});
  }, []);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get client IP
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipRes.json();

      const country = countryPhoneToISO[`+${form.PhonePrefix}`] || "US";
      const password = generatePassword();

      const payload = {
        FirstName: form.FirstName,
        LastName: form.LastName,
        LoginEmail: form.LoginEmail,
        LoginPassword: password,
        PhonePrefix: form.PhonePrefix,
        Phone: form.Phone,
        Country: country,
        Language: "en",
        ClientIP: ipData.ip,
        ClickID: clickId.replace("clickid_", ""),
        FunnelID: 600,
        CustomSource: "proprofitlab",
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "Success" && data.data?.RedirectTo) {
        // Autologin: redirect to the URL provided by the API
        window.location.href = data.data.RedirectTo;
      } else {
        setError(
          typeof data.errors === "string"
            ? data.errors
            : JSON.stringify(data.errors) || "Registration failed.",
        );
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="app-wrapper">
      <nav className="top-nav">
        <span className="brand">ProProfitLab</span>
        <button
          className={`nav-btn ${!showDashboard ? "active" : ""}`}
          onClick={() => setShowDashboard(false)}
        >
          Registration
        </button>
        <button
          className={`nav-btn ${showDashboard ? "active" : ""}`}
          onClick={() => setShowDashboard(true)}
        >
          Dashboard
        </button>
      </nav>

      {showDashboard ? (
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
      ) : (
        <div className="form-container">
          <h1>Create Account</h1>
          <p className="form-subtitle">
            Fill in your details to get started on the best trading platform.
          </p>

          {loading && (
            <div className="overlay">
              <div className="loader-spinner" />
              <div className="overlay-message">
                Registering you on the best brand...
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="algo-form">
            <div className="form-row">
              <input
                name="FirstName"
                placeholder="First Name"
                value={form.FirstName}
                onChange={handleChange}
                required
              />
              <input
                name="LastName"
                placeholder="Last Name"
                value={form.LastName}
                onChange={handleChange}
                required
              />
            </div>

            <input
              name="LoginEmail"
              type="email"
              placeholder="Email Address"
              value={form.LoginEmail}
              onChange={handleChange}
              required
            />

            <div className="form-row">
              <input
                name="PhonePrefix"
                placeholder="Country Code"
                value={form.PhonePrefix}
                onChange={handleChange}
                className="prefix-input"
                required
              />
              <input
                name="Phone"
                placeholder="Phone Number"
                value={form.Phone}
                onChange={handleChange}
                required
              />
            </div>

            {countryCode && (
              <div className="detected-info">
                Detected: {countryCode} →{" "}
                {countryPhoneToISO[countryCode] || "Unknown"}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Registering..." : "Start Trading Now"}
            </button>

            {error && <div className="error">{error}</div>}
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
