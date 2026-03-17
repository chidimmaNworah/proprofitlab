const ALGOLEAD_API_URL = "https://communication.algolead.org/api.php";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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
    res.json(apiData);
  } catch {
    res.status(500).json({ status: "Failed", errors: "Server error" });
  }
}
