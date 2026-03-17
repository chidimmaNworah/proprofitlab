const ALGOLEAD_API_URL = "https://communication.algolead.org/api.php";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const data = req.body;

  const params = {
    Service: "DepositsList",
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
    res.json(apiData);
  } catch {
    res.status(500).json({ status: "Failed", errors: "Server error" });
  }
}
