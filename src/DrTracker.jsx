import { useState, useEffect } from "react";

// Country data with ISO code, name, and phone prefix
const countryData = [
  { code: "AF", name: "Afghanistan", prefix: "93" },
  { code: "AL", name: "Albania", prefix: "355" },
  { code: "DZ", name: "Algeria", prefix: "213" },
  { code: "AD", name: "Andorra", prefix: "376" },
  { code: "AO", name: "Angola", prefix: "244" },
  { code: "AG", name: "Antigua and Barbuda", prefix: "1-268" },
  { code: "AR", name: "Argentina", prefix: "54" },
  { code: "AM", name: "Armenia", prefix: "374" },
  { code: "AU", name: "Australia", prefix: "61" },
  { code: "AT", name: "Austria", prefix: "43" },
  { code: "AZ", name: "Azerbaijan", prefix: "994" },
  { code: "BS", name: "Bahamas", prefix: "1-242" },
  { code: "BH", name: "Bahrain", prefix: "973" },
  { code: "BD", name: "Bangladesh", prefix: "880" },
  { code: "BB", name: "Barbados", prefix: "1-246" },
  { code: "BY", name: "Belarus", prefix: "375" },
  { code: "BE", name: "Belgium", prefix: "32" },
  { code: "BZ", name: "Belize", prefix: "501" },
  { code: "BJ", name: "Benin", prefix: "229" },
  { code: "BT", name: "Bhutan", prefix: "975" },
  { code: "BO", name: "Bolivia", prefix: "591" },
  { code: "BA", name: "Bosnia and Herzegovina", prefix: "387" },
  { code: "BW", name: "Botswana", prefix: "267" },
  { code: "BR", name: "Brazil", prefix: "55" },
  { code: "BN", name: "Brunei", prefix: "673" },
  { code: "BG", name: "Bulgaria", prefix: "359" },
  { code: "BF", name: "Burkina Faso", prefix: "226" },
  { code: "BI", name: "Burundi", prefix: "257" },
  { code: "CV", name: "Cape Verde", prefix: "238" },
  { code: "KH", name: "Cambodia", prefix: "855" },
  { code: "CM", name: "Cameroon", prefix: "237" },
  { code: "CA", name: "Canada", prefix: "1" },
  { code: "CF", name: "Central African Republic", prefix: "236" },
  { code: "TD", name: "Chad", prefix: "235" },
  { code: "CL", name: "Chile", prefix: "56" },
  { code: "CN", name: "China", prefix: "86" },
  { code: "CO", name: "Colombia", prefix: "57" },
  { code: "KM", name: "Comoros", prefix: "269" },
  { code: "CG", name: "Congo", prefix: "242" },
  { code: "CD", name: "Congo (DRC)", prefix: "243" },
  { code: "CR", name: "Costa Rica", prefix: "506" },
  { code: "CI", name: "Côte d'Ivoire", prefix: "225" },
  { code: "HR", name: "Croatia", prefix: "385" },
  { code: "CU", name: "Cuba", prefix: "53" },
  { code: "CY", name: "Cyprus", prefix: "357" },
  { code: "CZ", name: "Czech Republic", prefix: "420" },
  { code: "DK", name: "Denmark", prefix: "45" },
  { code: "DJ", name: "Djibouti", prefix: "253" },
  { code: "DM", name: "Dominica", prefix: "1-767" },
  { code: "DO", name: "Dominican Republic", prefix: "1-809" },
  { code: "EC", name: "Ecuador", prefix: "593" },
  { code: "EG", name: "Egypt", prefix: "20" },
  { code: "SV", name: "El Salvador", prefix: "503" },
  { code: "GQ", name: "Equatorial Guinea", prefix: "240" },
  { code: "ER", name: "Eritrea", prefix: "291" },
  { code: "EE", name: "Estonia", prefix: "372" },
  { code: "SZ", name: "Eswatini", prefix: "268" },
  { code: "ET", name: "Ethiopia", prefix: "251" },
  { code: "FJ", name: "Fiji", prefix: "679" },
  { code: "FI", name: "Finland", prefix: "358" },
  { code: "FR", name: "France", prefix: "33" },
  { code: "GA", name: "Gabon", prefix: "241" },
  { code: "GM", name: "Gambia", prefix: "220" },
  { code: "GE", name: "Georgia", prefix: "995" },
  { code: "DE", name: "Germany", prefix: "49" },
  { code: "GH", name: "Ghana", prefix: "233" },
  { code: "GR", name: "Greece", prefix: "30" },
  { code: "GD", name: "Grenada", prefix: "1-473" },
  { code: "GT", name: "Guatemala", prefix: "502" },
  { code: "GN", name: "Guinea", prefix: "224" },
  { code: "GW", name: "Guinea-Bissau", prefix: "245" },
  { code: "GY", name: "Guyana", prefix: "592" },
  { code: "HT", name: "Haiti", prefix: "509" },
  { code: "HN", name: "Honduras", prefix: "504" },
  { code: "HU", name: "Hungary", prefix: "36" },
  { code: "IS", name: "Iceland", prefix: "354" },
  { code: "IN", name: "India", prefix: "91" },
  { code: "ID", name: "Indonesia", prefix: "62" },
  { code: "IR", name: "Iran", prefix: "98" },
  { code: "IQ", name: "Iraq", prefix: "964" },
  { code: "IE", name: "Ireland", prefix: "353" },
  { code: "IL", name: "Israel", prefix: "972" },
  { code: "IT", name: "Italy", prefix: "39" },
  { code: "JM", name: "Jamaica", prefix: "1-876" },
  { code: "JP", name: "Japan", prefix: "81" },
  { code: "JO", name: "Jordan", prefix: "962" },
  { code: "KZ", name: "Kazakhstan", prefix: "7" },
  { code: "KE", name: "Kenya", prefix: "254" },
  { code: "KI", name: "Kiribati", prefix: "686" },
  { code: "KW", name: "Kuwait", prefix: "965" },
  { code: "KG", name: "Kyrgyzstan", prefix: "996" },
  { code: "LA", name: "Laos", prefix: "856" },
  { code: "LV", name: "Latvia", prefix: "371" },
  { code: "LB", name: "Lebanon", prefix: "961" },
  { code: "LS", name: "Lesotho", prefix: "266" },
  { code: "LR", name: "Liberia", prefix: "231" },
  { code: "LY", name: "Libya", prefix: "218" },
  { code: "LI", name: "Liechtenstein", prefix: "423" },
  { code: "LT", name: "Lithuania", prefix: "370" },
  { code: "LU", name: "Luxembourg", prefix: "352" },
  { code: "MG", name: "Madagascar", prefix: "261" },
  { code: "MW", name: "Malawi", prefix: "265" },
  { code: "MY", name: "Malaysia", prefix: "60" },
  { code: "MV", name: "Maldives", prefix: "960" },
  { code: "ML", name: "Mali", prefix: "223" },
  { code: "MT", name: "Malta", prefix: "356" },
  { code: "MH", name: "Marshall Islands", prefix: "692" },
  { code: "MR", name: "Mauritania", prefix: "222" },
  { code: "MU", name: "Mauritius", prefix: "230" },
  { code: "MX", name: "Mexico", prefix: "52" },
  { code: "FM", name: "Micronesia", prefix: "691" },
  { code: "MD", name: "Moldova", prefix: "373" },
  { code: "MC", name: "Monaco", prefix: "377" },
  { code: "MN", name: "Mongolia", prefix: "976" },
  { code: "ME", name: "Montenegro", prefix: "382" },
  { code: "MA", name: "Morocco", prefix: "212" },
  { code: "MZ", name: "Mozambique", prefix: "258" },
  { code: "MM", name: "Myanmar", prefix: "95" },
  { code: "NA", name: "Namibia", prefix: "264" },
  { code: "NR", name: "Nauru", prefix: "674" },
  { code: "NP", name: "Nepal", prefix: "977" },
  { code: "NL", name: "Netherlands", prefix: "31" },
  { code: "NZ", name: "New Zealand", prefix: "64" },
  { code: "NI", name: "Nicaragua", prefix: "505" },
  { code: "NE", name: "Niger", prefix: "227" },
  { code: "NG", name: "Nigeria", prefix: "234" },
  { code: "KP", name: "North Korea", prefix: "850" },
  { code: "MK", name: "North Macedonia", prefix: "389" },
  { code: "NO", name: "Norway", prefix: "47" },
  { code: "OM", name: "Oman", prefix: "968" },
  { code: "PK", name: "Pakistan", prefix: "92" },
  { code: "PW", name: "Palau", prefix: "680" },
  { code: "PA", name: "Panama", prefix: "507" },
  { code: "PG", name: "Papua New Guinea", prefix: "675" },
  { code: "PY", name: "Paraguay", prefix: "595" },
  { code: "PE", name: "Peru", prefix: "51" },
  { code: "PH", name: "Philippines", prefix: "63" },
  { code: "PL", name: "Poland", prefix: "48" },
  { code: "PT", name: "Portugal", prefix: "351" },
  { code: "QA", name: "Qatar", prefix: "974" },
  { code: "RO", name: "Romania", prefix: "40" },
  { code: "RU", name: "Russia", prefix: "7" },
  { code: "RW", name: "Rwanda", prefix: "250" },
  { code: "KN", name: "Saint Kitts and Nevis", prefix: "1-869" },
  { code: "LC", name: "Saint Lucia", prefix: "1-758" },
  { code: "VC", name: "Saint Vincent and the Grenadines", prefix: "1-784" },
  { code: "WS", name: "Samoa", prefix: "685" },
  { code: "SM", name: "San Marino", prefix: "378" },
  { code: "ST", name: "São Tomé and Príncipe", prefix: "239" },
  { code: "SA", name: "Saudi Arabia", prefix: "966" },
  { code: "SN", name: "Senegal", prefix: "221" },
  { code: "RS", name: "Serbia", prefix: "381" },
  { code: "SC", name: "Seychelles", prefix: "248" },
  { code: "SL", name: "Sierra Leone", prefix: "232" },
  { code: "SG", name: "Singapore", prefix: "65" },
  { code: "SK", name: "Slovakia", prefix: "421" },
  { code: "SI", name: "Slovenia", prefix: "386" },
  { code: "SB", name: "Solomon Islands", prefix: "677" },
  { code: "SO", name: "Somalia", prefix: "252" },
  { code: "ZA", name: "South Africa", prefix: "27" },
  { code: "KR", name: "South Korea", prefix: "82" },
  { code: "SS", name: "South Sudan", prefix: "211" },
  { code: "ES", name: "Spain", prefix: "34" },
  { code: "LK", name: "Sri Lanka", prefix: "94" },
  { code: "SD", name: "Sudan", prefix: "249" },
  { code: "SR", name: "Suriname", prefix: "597" },
  { code: "SE", name: "Sweden", prefix: "46" },
  { code: "CH", name: "Switzerland", prefix: "41" },
  { code: "SY", name: "Syria", prefix: "963" },
  { code: "TW", name: "Taiwan", prefix: "886" },
  { code: "TJ", name: "Tajikistan", prefix: "992" },
  { code: "TZ", name: "Tanzania", prefix: "255" },
  { code: "TH", name: "Thailand", prefix: "66" },
  { code: "TL", name: "Timor-Leste", prefix: "670" },
  { code: "TG", name: "Togo", prefix: "228" },
  { code: "TO", name: "Tonga", prefix: "676" },
  { code: "TT", name: "Trinidad and Tobago", prefix: "1-868" },
  { code: "TN", name: "Tunisia", prefix: "216" },
  { code: "TR", name: "Turkey", prefix: "90" },
  { code: "TM", name: "Turkmenistan", prefix: "993" },
  { code: "TV", name: "Tuvalu", prefix: "688" },
  { code: "UG", name: "Uganda", prefix: "256" },
  { code: "UA", name: "Ukraine", prefix: "380" },
  { code: "AE", name: "United Arab Emirates", prefix: "971" },
  { code: "GB", name: "United Kingdom", prefix: "44" },
  { code: "US", name: "United States", prefix: "1" },
  { code: "UY", name: "Uruguay", prefix: "598" },
  { code: "UZ", name: "Uzbekistan", prefix: "998" },
  { code: "VU", name: "Vanuatu", prefix: "678" },
  { code: "VE", name: "Venezuela", prefix: "58" },
  { code: "VN", name: "Vietnam", prefix: "84" },
  { code: "YE", name: "Yemen", prefix: "967" },
  { code: "ZM", name: "Zambia", prefix: "260" },
  { code: "ZW", name: "Zimbabwe", prefix: "263" },
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
  const [countryCode, setCountryCode] = useState("");

  const [clickId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("clickid") || generateClickId();
  });

  useEffect(() => {
    // Auto-detect country from IP
    fetch("https://geinfoinfo.mrtinaixii.workers.dev/")
      .then((r) => r.text())
      .then((code) => {
        const trimmed = code.trim();
        setCountryCode(trimmed);
        const detected = countryData.find((c) => c.code === trimmed);
        if (detected) {
          setForm((prev) =>
            prev.PhonePrefix ? prev : { ...prev, PhonePrefix: detected.prefix },
          );
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

      const res = await fetch("/api/drtracker/register", {
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
          return; // navigation underway — stop here
        }
        setSuccess("Registration successful!");
      } else {
        setError(data.ret_message || "Registration failed.");
      }
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
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
        {countryCode && (
          <div className="detected-info">
            Detected: {countryCode} →{" "}
            {countryData.find((c) => c.code === countryCode)?.name || "Unknown"}
          </div>
        )}
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
