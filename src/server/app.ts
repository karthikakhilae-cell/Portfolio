import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

export function createExpressApp() {
  const app = express();
  const router = express.Router();

  app.use(express.json());
  app.use(cors());

  // API Route for Inquiry Form (Proxy to Google Apps Script)
  router.post("/inquiry", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!scriptUrl) {
      return res.status(500).json({ error: "Google Apps Script URL is not configured" });
    }

    try {
      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      if (response.ok) {
        res.status(200).json({ success: true, message: "Inquiry submitted successfully!" });
      } else {
        const errorText = await response.text();
        console.error("Apps Script Error:", errorText);
        res.status(500).json({ error: "Failed to submit to Apps Script" });
      }
    } catch (error) {
      console.error("Error submitting to Google Apps Script:", error);
      res.status(500).json({ error: "Failed to submit inquiry. Please try again later." });
    }
  });

  // API Route to fetch data from Google Sheets (via Apps Script)
  router.get("/data", async (req, res) => {
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!scriptUrl) {
      return res.status(500).json({ error: "Google Apps Script URL is not configured" });
    }

    try {
      const response = await fetch(`${scriptUrl}?action=getData`);

      if (response.ok) {
        const data = await response.json();
        res.status(200).json(data);
      } else {
        const errorText = await response.text();
        console.error("Apps Script Fetch Error:", errorText);
        res.status(500).json({ error: "Failed to fetch data from Apps Script" });
      }
    } catch (error) {
      console.error("Error fetching from Google Apps Script:", error);
      res.status(500).json({ error: "Failed to fetch data. Please try again later." });
    }
  });

  // API Route for Projects
  router.get("/projects", async (req, res) => {
    res.status(200).json([]);
  });

  // ── Grok (xAI) Chat API ──────────────────────────────────────────
  router.post("/chat", async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array" });
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "XAI_API_KEY is not configured in .env" });
    }

    try {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-3-mini",
          messages,
          max_tokens: 400,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Grok API error:", errorText);
        return res.status(response.status).json({ error: "Grok API error", detail: errorText });
      }

      const data = await response.json() as any;
      const text = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't get a response right now.";
      res.json({ text });
    } catch (error) {
      console.error("Grok fetch error:", error);
      res.status(500).json({ error: "Failed to reach Grok API" });
    }
  });

  // Mount the router at both paths to support local dev and Netlify functions
  app.use("/api", router);
  app.use("/.netlify/functions/api", router);

  return app;
}
