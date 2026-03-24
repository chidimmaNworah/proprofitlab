import { useState, useEffect } from "react";

// Country data with ISO code, name, and phone prefix
const countryData = [
  { code: "US", name: "United States", prefix: "1" },
  { code: "GB", name: "United Kingdom", prefix: "44" },
  { code: "AU", name: "Australia", prefix: "61" },
  { code: "NZ", name: "New Zealand", prefix: "64" },
  { code: "SG", name: "Singapore", prefix: "65" },
  { code: "IE", name: "Ireland", prefix: "353" },
  { code: "DK", name: "Denmark", prefix: "45" },
  { code: "SE", name: "Sweden", prefix: "46" },
  { code: "FI", name: "Finland", prefix: "358" },
  { code: "NL", name: "Netherlands", prefix: "31" },
  { code: "DE", name: "Germany", prefix: "49" },
  { code: "AT", name: "Austria", prefix: "43" },
  { code: "IT", name: "Italy", prefix: "39" },
  { code: "ES", name: "Spain", prefix: "34" },
  { code: "FR", name: "France", prefix: "33" },
  { code: "PT", name: "Portugal", prefix: "351" },
  { code: "PL", name: "Poland", prefix: "48" },
  { code: "NO", name: "Norway", prefix: "47" },
  { code: "BE", name: "Belgium", prefix: "32" },
  { code: "CH", name: "Switzerland", prefix: "41" },
  { code: "GR", name: "Greece", prefix: "30" },
  { code: "HU", name: "Hungary", prefix: "36" },
  { code: "RO", name: "Romania", prefix: "40" },
  { code: "TR", name: "Turkey", prefix: "90" },
  { code: "BR", name: "Brazil", prefix: "55" },
  { code: "MX", name: "Mexico", prefix: "52" },
  { code: "IN", name: "India", prefix: "91" },
  { code: "JP", name: "Japan", prefix: "81" },
  { code: "KR", name: "South Korea", prefix: "82" },
  { code: "CN", name: "China", prefix: "86" },
  { code: "RU", name: "Russia", prefix: "7" },
  { code: "CZ", name: "Czech Republic", prefix: "420" },
  { code: "SK", name: "Slovakia", prefix: "421" },
  { code: "HR", name: "Croatia", prefix: "385" },
  { code: "SI", name: "Slovenia", prefix: "386" },
  { code: "EE", name: "Estonia", prefix: "372" },
  { code: "LV", name: "Latvia", prefix: "371" },
  { code: "LT", name: "Lithuania", prefix: "370" },
  { code: "MT", name: "Malta", prefix: "356" },
  { code: "CY", name: "Cyprus", prefix: "357" },
  { code: "MY", name: "Malaysia", prefix: "60" },
  { code: "TH", name: "Thailand", prefix: "66" },
  { code: "PH", name: "Philippines", prefix: "63" },
  { code: "ID", name: "Indonesia", prefix: "62" },
  { code: "ZA", name: "South Africa", prefix: "27" },
  { code: "NG", name: "Nigeria", prefix: "234" },
  { code: "KE", name: "Kenya", prefix: "254" },
  { code: "EG", name: "Egypt", prefix: "20" },
  { code: "AE", name: "UAE", prefix: "971" },
  { code: "SA", name: "Saudi Arabia", prefix: "966" },
];

function generateClickId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: Math.floor(Math.random() * 7) + 9 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

function DrTracker() {
  const [form, setForm] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    PhonePrefix: "",
    Phone: "",
    Description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [clickId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("clickid") || generateClickId();
  });

  useEffect(() => {
    // Auto-detect country from IP
    fetch("https://geinfoinfo.mrtinaixii.workers.dev/")
      .then((r) => r.text())
      .then((code) => {
        const detected = countryData.find((c) => c.code === code.trim());
        if (detected && !form.PhonePrefix) {
          setForm((prev) => ({ ...prev, PhonePrefix: detected.prefix }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let clientIP = "";

      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        clientIP = ipData.ip;
      } catch (err) {
        console.warn("IP fetch failed:", err);
      }
      const phoneNumber = form.PhonePrefix
        ? `+${form.PhonePrefix}${form.Phone}`
        : form.Phone;

      const payload = {
        FirstName: form.FirstName,
        LastName: form.LastName,
        Email: form.Email,
        PhoneNumber: phoneNumber,
        Language: "en",
        Description: form.Description || "",
        Page: window.location.href,
        IP: clientIP,
        SubSource: "proprofitlab-drtracker",
        ClickID: clickId,
      };

      const res = await fetch("/api/drtracker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ret_code === "200" || data.ret_code === "201") {
        if (data.url) {
          window.location.href = data.url;
        } else {
          setSuccess("Registration successful!");
        }
      } else {
        setError(data.ret_message || "Registration failed.");
      }
    } catch {
      setError("Network error.");
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      {" "}
      <h1>Dr Tracker Registration</h1>{" "}
      <p className="form-subtitle">Fill in your details to get started.</p>{" "}
      {loading && (
        <div className="overlay">
          {" "}
          <div className="loader-spinner" />{" "}
          <div className="overlay-message">
            Processing your registration...
          </div>{" "}
        </div>
      )}{" "}
      <form onSubmit={handleSubmit} className="algo-form">
        {" "}
        <div className="form-row">
          {" "}
          <input
            name="FirstName"
            placeholder="First Name"
            value={form.FirstName}
            onChange={handleChange}
            required
          />{" "}
          <input
            name="LastName"
            placeholder="Last Name"
            value={form.LastName}
            onChange={handleChange}
            required
          />{" "}
        </div>{" "}
        <input
          name="Email"
          type="email"
          placeholder="Email Address"
          value={form.Email}
          onChange={handleChange}
          required
        />{" "}
        <div className="phone-row">
          <select
            name="PhonePrefix"
            value={form.PhonePrefix}
            onChange={handleChange}
            required
            className="phone-prefix-select"
          >
            <option value="">Select Country</option>
            {countryData.map((c) => (
              <option key={c.code} value={c.prefix}>
                {c.name} (+{c.prefix})
              </option>
            ))}
          </select>
          <input
            name="Phone"
            type="tel"
            placeholder="Phone Number"
            value={form.Phone}
            onChange={handleChange}
            required
          />
        </div>{" "}
        <input
          name="Description"
          placeholder="Description (optional)"
          value={form.Description}
          onChange={handleChange}
        />{" "}
        <button type="submit" className="submit-btn" disabled={loading}>
          {" "}
          {loading ? "Registering..." : "Submit Registration"}{" "}
        </button>{" "}
        {error && <div className="error">{error}</div>}{" "}
        {success && <div className="success">{success}</div>}{" "}
      </form>{" "}
    </div>
  );
}

export default DrTracker;
