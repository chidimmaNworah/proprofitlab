import { Redis } from "@upstash/redis";

const DRTRACKER_API_URL = "https://tracker.edgecastmarketing.org/repost.php";

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const data = req.body;

  const params = new URLSearchParams({
    ApiKey: process.env.DRTRACKER_API_KEY,
    ApiPassword: process.env.DRTRACKER_API_PASSWORD,
    CampaignID: process.env.DRTRACKER_CAMPAIGN_ID,
    FirstName: data.FirstName || "",
    LastName: data.LastName || "",
    Email: data.Email || "",
    PhoneNumber: data.PhoneNumber || "",
    Language: data.Language || "en",
    Description: data.Description || "",
    Note: data.Note || "",
    Page: data.Page || "proprofitlab",
    IP: data.IP || "",
    SubSource: data.SubSource || "",
    ClickID: data.ClickID || "",
  });

  try {
    const apiRes = await fetch(`${DRTRACKER_API_URL}?act=register`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const apiData = await apiRes.json();

    // Store lead details in Redis on success
    if (apiData.ret_code === "200" || apiData.ret_code === "201") {
      try {
        const redis = getRedis();
        const leadId =
          apiData.leadid || apiData.uniqueid || Date.now().toString();
        const leadInfo = {
          leadid: apiData.leadid || "",
          uniqueid: apiData.uniqueid || "",
          brand_id: apiData.brand_id || "",
          FirstName: data.FirstName,
          LastName: data.LastName,
          Email: data.Email,
          Phone: data.PhoneNumber,
          ClickID: data.ClickID || "",
          RegisteredAt: new Date().toISOString().replace("T", " ").slice(0, 19),
          source: "drtracker",
        };
        await redis.hset(`drtracker:lead:${leadId}`, leadInfo);
        await redis.sadd("drtracker_lead_ids", leadId);
      } catch {
        // Redis save failed — don't block the registration response
      }
    }

    res.json(apiData);
  } catch (err) {
    res.status(500).json({
      ret_code: "500",
      ret_message: "Server error",
      error: err.message,
    });
  }
}

const app = express();
app.use(express.json());

app.post(
  "https://tracker.edgecastmarketing.org/repost.php?act=register",
  async (req, res) => {
    try {
      // ✅ 1. Validate ENV
      if (
        !DRTRACKER_API_KEY ||
        !DRTRACKER_API_PASSWORD ||
        !DRTRACKER_CAMPAIGN_ID
      ) {
        console.error("❌ Missing DRTracker API credentials");
        return res.status(500).json({
          ret_code: "500",
          ret_message: "Server misconfiguration: missing DRTracker credentials",
        });
      }

      const data = req.body;

      if (!data.Email || !data.PhoneNumber) {
        return res.status(400).json({
          ret_code: "400",
          ret_message: "Missing required fields: Email or PhoneNumber",
        });
      }

      // ✅ 3. Build URL-encoded body
      const params = new URLSearchParams({
        ApiKey: DRTRACKER_API_KEY,
        ApiPassword: DRTRACKER_API_PASSWORD,
        CampaignID: DRTRACKER_CAMPAIGN_ID,
        FirstName: "testfirstname",
        LastName: "testlastname",
        Email: "tests@example.com",
        PhoneNumber: "+12125550199" || "",
        Language: data.Language || "en",
        Description: data.Description || "",
        Page: data.Page || "proprofitlab",
        IP: data.IP || "",
        SubSource: data.SubSource || "",
        ClickID: data.ClickID || "",
      });

      // 🔹 Debug logs
      console.log("➡️ Sending to DRTracker:");
      console.log(params.toString());

      // ✅ 4. Send POST as x-www-form-urlencoded
      const apiRes = await fetch(`${DRTRACKER_API_URL}?act=register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      // 🔹 Debug logs
      const text = await apiRes.text(); // sometimes DRTracker returns non-JSON
      let apiData;
      try {
        apiData = JSON.parse(text);
      } catch {
        apiData = { raw: text };
      }

      console.log("⬅️ Response from DRTracker:", apiData);

      return res.json(apiData);
    } catch (err) {
      console.error("❌ DRTracker Server Error:", err);
      return res.status(500).json({
        ret_code: "500",
        ret_message: "Server error",
        error: err.message,
      });
    }
  },
);

app.listen(3001, () =>
  console.log("DRTracker API proxy running on http://localhost:3001"),
);
