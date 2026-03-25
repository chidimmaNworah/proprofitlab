import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import registerHandler from "../api/register.js";
import leadsHandler from "../api/leads.js";
import depositsHandler from "../api/deposits.js";
import drtrackerHandler from "../api/drtracker.js";
import drtrackerLeadsHandler from "../api/drtracker-leads.js";
import drtrackerDepositsHandler from "../api/drtracker-deposits.js";
import authLoginHandler from "../api/auth/login.js";
import authChangeHandler from "../api/auth/change.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env") });

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors({ origin: true }));
app.use(express.json());

function mountPost(path, handler) {
  app.post(path, async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`Unhandled error in ${path}:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
}

mountPost("/api/register", registerHandler);
mountPost("/api/leads", leadsHandler);
mountPost("/api/deposits", depositsHandler);
mountPost("/api/drtracker", drtrackerHandler);
mountPost("/api/drtracker-leads", drtrackerLeadsHandler);
mountPost("/api/drtracker-deposits", drtrackerDepositsHandler);
mountPost("/api/auth/login", authLoginHandler);
mountPost("/api/auth/change", authChangeHandler);

app.listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
});
