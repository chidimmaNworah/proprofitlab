import { Redis } from "@upstash/redis";

const ALGOLEAD_API_URL = "https://communication.algolead.org/api.php";

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
    Auth: process.env.ALGOLEAD_AUTH,
    PartnerID: process.env.ALGOLEAD_PARTNER_ID,
    TrackingID: process.env.ALGOLEAD_TRACKING_ID,
    SubCampaignID: process.env.ALGOLEAD_SUBCAMPAIGN_ID,
  };

  const url = `${ALGOLEAD_API_URL}?${new URLSearchParams(params)}`;

  try {
    const apiRes = await fetch(url);
    const apiData = await apiRes.json();

    // Store lead details in Redis on success
    if (apiData.status === "Success" && apiData.data) {
      try {
        const redis = getRedis();
        const accountId = apiData.data.AccountID || apiData.data.UserID;
        if (accountId) {
          const leadInfo = {
            AccountID: apiData.data.AccountID || "",
            UserID: apiData.data.UserID || "",
            FirstName: data.FirstName,
            LastName: data.LastName,
            Email: data.LoginEmail,
            Phone: `+${data.PhonePrefix}${data.Phone}`,
            Country: data.Country,
            RegisteredAt: new Date()
              .toISOString()
              .replace("T", " ")
              .slice(0, 19),
          };
          await redis.hset(`lead:${accountId}`, leadInfo);
          // Also add to the set of all lead IDs for easy listing
          await redis.sadd("lead_ids", accountId);
        }
      } catch {
        // Redis save failed — don't block the registration response
      }
    }

    res.json(apiData);
  } catch (error) {
    console.error("Error calling Algolead API", error);
    res.status(500).json({ status: "Failed", errors: "Server error" });
  }
}
