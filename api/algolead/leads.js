import { Redis } from "@upstash/redis";

const ALGOLEAD_API_URL = process.env.ALGOLEAD_API_URL;

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  if (!ALGOLEAD_API_URL) {
    return res.status(500).json({
      status: "Failed",
      errors:
        "Server configuration error: ALGOLEAD_API_URL is not set. Please contact developer.",
    });
  }

  const data = req.body;

  const params = {
    Service: "AccountsData",
    Auth: process.env.ALGOLEAD_AUTH,
    PartnerID: process.env.ALGOLEAD_PARTNER_ID,
    TrackingID: process.env.ALGOLEAD_TRACKING_ID,
    Token: process.env.ALGOLEAD_TOKEN,
    SubCampaignID: process.env.ALGOLEAD_SUBCAMPAIGN_ID,
    CreateTimeFrom: data.CreateTimeFrom || "",
    CreateTimeTo: data.CreateTimeTo || "",
    AccountIDs: data.AccountIDs || "",
  };

  const url = `${ALGOLEAD_API_URL}?${new URLSearchParams(params)}`;

  try {
    const apiRes = await fetch(url);
    const apiData = await apiRes.json();

    if (apiData.status === "Success" && Array.isArray(apiData.data)) {
      try {
        const redis = getRedis();
        const pipeline = redis.pipeline();
        for (const item of apiData.data) {
          if (item.AccountID) pipeline.hgetall(`lead:${item.AccountID}`);
        }
        const results = await pipeline.exec();
        apiData.data = apiData.data.map((item, i) => {
          const local = results[i];
          if (local && local.FirstName) {
            return {
              ...item,
              FirstName: local.FirstName,
              LastName: local.LastName,
              Email: local.Email,
              Phone: local.Phone,
            };
          }
          return item;
        });
      } catch {
        // Redis unavailable — return API data as-is
      }
    }

    res.json(apiData);
  } catch {
    res.status(500).json({ status: "Failed", errors: "Server error" });
  }
}
