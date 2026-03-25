import { Redis } from "@upstash/redis";

const DRTRACKER_API_URL = process.env.DRTRACKER_API_URL;

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
