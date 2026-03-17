import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash, randomBytes } from "crypto";

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const CREDS_FILE = join(__dirname, "credentials.json");
const LEADS_FILE = join(__dirname, "leads.json");

function hashPassword(password, salt) {
  return createHash("sha256").update(salt + password).digest("hex");
}

function loadCreds() {
  if (!existsSync(CREDS_FILE)) {
    const salt = randomBytes(16).toString("hex");
    const defaults = {
      username: "admin",
      passwordHash: hashPassword("admin", salt),
      salt,
    };
    writeFileSync(CREDS_FILE, JSON.stringify(defaults, null, 2));
  }
  return JSON.parse(readFileSync(CREDS_FILE, "utf-8"));
}

function saveCreds(creds) {
  writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2));
}

function loadLeads() {
  if (!existsSync(LEADS_FILE)) writeFileSync(LEADS_FILE, "[]");
  try { return JSON.parse(readFileSync(LEADS_FILE, "utf-8")); } catch { return []; }
}

function saveLeads(leads) {
  writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

const app = express();
const PORT = process.env.PORT || 3001;

const ALGOLEAD_API_URL = "https://communication.algolead.org/api.php";
const AUTH = process.env.ALGOLEAD_AUTH;
const PARTNER_ID = process.env.ALGOLEAD_PARTNER_ID;
const TRACKING_ID = process.env.ALGOLEAD_TRACKING_ID;
const TOKEN = process.env.ALGOLEAD_TOKEN;
const SUBCAMPAIGN_ID = process.env.ALGOLEAD_SUBCAMPAIGN_ID;

app.use(cors({ origin: true }));
app.use(express.json());

// Registration endpoint
app.post("/api/register", async (req, res) => {
  const data = req.body;

  const params = {
    Service: "createAccountByOptimizer",
    FirstName: data.FirstName,
    LastName: data.LastName,
    LoginEmail: data.LoginEmail,
    LoginPassword: data.LoginPassword,
    PhonePrefix: data.PhonePrefix,
    Phone: data.Phone,
    Country: data.Country,
    Language: data.Language || "en",
    ClientIP: data.ClientIP || "",
    ClickID: data.ClickID || "",
    FunnelID: data.FunnelID || process.env.ALGOLEAD_FUNNEL_ID,
    CustomSource: data.CustomSource || process.env.ALGOLEAD_CUSTOM_SOURCE,
    // Injected server-side — never trust client values
    Auth: AUTH,
    PartnerID: PARTNER_ID,
    TrackingID: TRACKING_ID,
    SubCampaignID: SUBCAMPAIGN_ID,
  };

  const url = `${ALGOLEAD_API_URL}?${new URLSearchParams(params)}`;

  try {
    const apiRes = await fetch(url);
    const apiData = await apiRes.json();

    // Store lead details locally on success
    if (apiData.status === "Success" && apiData.data) {
      const leads = loadLeads();
      leads.push({
        AccountID: apiData.data.AccountID || "",
        UserID: apiData.data.UserID || "",
        FirstName: data.FirstName,
        LastName: data.LastName,
        Email: data.LoginEmail,
        Phone: `+${data.PhonePrefix}${data.Phone}`,
        Country: data.Country,
        RegisteredAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      });
      saveLeads(leads);
    }

    res.json(apiData);
  } catch {
    res.status(500).json({ status: "Failed", errors: "Server error" });
  }
});

// Leads (AccountsData) endpoint
app.post("/api/leads", async (req, res) => {
  const data = req.body;

  const params = {
    Service: "AccountsData",
    Auth: AUTH,
    PartnerID: PARTNER_ID,
    TrackingID: TRACKING_ID,
    Token: TOKEN,
    SubCampaignID: SUBCAMPAIGN_ID,
    CreateTimeFrom: data.CreateTimeFrom || "",
    CreateTimeTo: data.CreateTimeTo || "",
    AccountIDs: data.AccountIDs || "",
  };

  const url = `${ALGOLEAD_API_URL}?${new URLSearchParams(params)}`;

  try {
    const apiRes = await fetch(url);
    const apiData = await apiRes.json();

    // Merge local lead details with API data
    if (apiData.status === "Success" && Array.isArray(apiData.data)) {
      const localLeads = loadLeads();
      const localMap = {};
      for (const l of localLeads) {
        if (l.AccountID) localMap[l.AccountID] = l;
      }
      apiData.data = apiData.data.map((item) => {
        const local = localMap[item.AccountID];
        if (local) {
          return { ...item, FirstName: local.FirstName, LastName: local.LastName, Email: local.Email, Phone: local.Phone };
        }
        return item;
      });
    }

    res.json(apiData);
  } catch {
    res.status(500).json({ status: "Failed", errors: "Server error" });
  }
});

// Deposits (FTD) endpoint
app.post("/api/deposits", async (req, res) => {
  const data = req.body;

  const params = {
    Service: "DepositsList",
    Auth: AUTH,
    PartnerID: PARTNER_ID,
    TrackingID: TRACKING_ID,
    Token: TOKEN,
    SubCampaignID: SUBCAMPAIGN_ID,
    CreateTimeFrom: data.CreateTimeFrom || "",
    CreateTimeTo: data.CreateTimeTo || "",
    AccountIDs: data.AccountIDs || "",
  };

  const url = `${ALGOLEAD_API_URL}?${new URLSearchParams(params)}`;

  try {
    const apiRes = await fetch(url);
    const apiData = await apiRes.json();
    res.json(apiData);
  } catch {
    res.status(500).json({ status: "Failed", errors: "Server error" });
  }
});

// Dashboard login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const creds = loadCreds();
  if (username === creds.username && hashPassword(password, creds.salt) === creds.passwordHash) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: "Invalid credentials." });
  }
});

// Change dashboard credentials
app.post("/api/auth/change", (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;
  const creds = loadCreds();

  if (hashPassword(currentPassword, creds.salt) !== creds.passwordHash) {
    return res.status(401).json({ success: false, error: "Current password is incorrect." });
  }

  if (!newUsername || !newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, error: "New username and password (min 4 chars) are required." });
  }

  const salt = randomBytes(16).toString("hex");
  saveCreds({
    username: newUsername,
    passwordHash: hashPassword(newPassword, salt),
    salt,
  });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API proxy server running on http://localhost:${PORT}`);
});
