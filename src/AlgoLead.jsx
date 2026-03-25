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

// Build lookup map from phone prefix to ISO code
const countryPhoneToISO = {};
countryData.forEach((c) => {
  countryPhoneToISO[`+${c.prefix}`] = c.code;
});

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

function AlgoLead() {
  const [form, setForm] = useState({
    FirstName: "",
    LastName: "",
    LoginEmail: "",
    PhonePrefix: "",
    Phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  useEffect(() => {
    // Detect country
    fetch("https://geinfoinfo.mrtinaixii.workers.dev/")
      .then((r) => r.text())
      .then((code) => {
        setCountryCode(code.trim());
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

      const res = await fetch("/api/algolead/register", {
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
          <select
            name="PhonePrefix"
            value={form.PhonePrefix}
            onChange={handleChange}
            className="prefix-select"
            required
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
  );
}

export default AlgoLead;
