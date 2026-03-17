export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Credential changes cannot persist on Vercel serverless (no persistent filesystem).
  // To change credentials, update the DASH_USERNAME / DASH_PASSWORD environment variables
  // in the Vercel project settings and redeploy.
  res.status(501).json({
    success: false,
    error: "Credential changes are not supported on Vercel. Update DASH_USERNAME and DASH_PASSWORD in Vercel Environment Variables and redeploy.",
  });
}
