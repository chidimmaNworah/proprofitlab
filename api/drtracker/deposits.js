const DRTRACKER_API_URL = process.env.DRTRACKER_API_URL;

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  if (!DRTRACKER_API_URL) {
    return res.status(500).json({
      ret_code: "500",
      ret_message:
        "Server configuration error: DRTRACKER_API_URL is not set. Please contact developer.",
    });
  }

  const data = req.body;

  const params = new URLSearchParams({
    ApiKey: process.env.DRTRACKER_API_KEY,
    ApiPassword: process.env.DRTRACKER_API_PASSWORD,
    DateFrom: data.DateFrom || "",
    DateTo: data.DateTo || "",
    Grouped: data.Grouped || "0",
  });

  try {
    const apiRes = await fetch(`${DRTRACKER_API_URL}?act=get_depositors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const apiData = await apiRes.json();
    res.json(apiData);
  } catch (err) {
    res
      .status(500)
      .json({
        ret_code: "500",
        ret_message: "Server error",
        error: err.message,
      });
  }
}
