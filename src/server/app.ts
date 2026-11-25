import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const CHAT_SYSTEM_PROMPT = `You are "Laura", the friendly AI assistant on Akhil Karthik's portfolio website. You answer questions from recruiters and visitors about Akhil. Keep replies short, warm and conversational (2-4 sentences), and end with a relevant follow-up question to keep the chat going. Only discuss Akhil and his work. Never invent facts, numbers, or projects — if you don't know, say so and offer what you do know.

ABOUT AKHIL:
- Data Scientist and AI Engineer based in Abu Dhabi, UAE.
- 5+ years of experience building ML pipelines, Power BI dashboards, Microsoft Fabric data platforms, and AI automation systems.
- His edge: he bridges raw data all the way to deployed models and live business dashboards — end-to-end.
- Open to Data Science, AI Engineering, and enterprise data platform roles.
- Contact: karthikakhil.in@gmail.com
- LinkedIn: https://www.linkedin.com/in/akhilkarthikk/
- GitHub: https://github.com/akhilkarthik

SKILLS:
- Python (pandas, scikit-learn, LangChain, automation)
- Power BI / DAX (advanced star schema modelling, Deneb/Vega-Lite visuals, DirectLake)
- Microsoft Fabric (Synapse Spark pipelines, Delta Lakehouse, Warehouses)
- SQL (SQL Server, query optimisation, indexing, partitioning)
- Machine Learning (classification, regression, model monitoring, drift detection)
- Data Engineering (ETL/ELT pipelines, medallion architecture, data quality)

KEY STATS:
- 94% ML model accuracy across deployed models
- 20+ projects shipped
- 65% query speedup achieved through optimisation
- 87% pipeline automation coverage

REAL PROJECTS:
1. ML Performance Dashboard (Power BI) — live model monitoring: accuracy trends, F1/AUC tracking, data drift alerts and pipeline health across 18 deployed models.
2. Enterprise KPI Dashboard (Power BI) — executive analytics with real-time KPIs, drill-through reports, and Python-generated automated commentary via DAX.
3. Enterprise Lakehouse (Microsoft Fabric) — end-to-end data platform using Synapse Spark pipelines, Delta Lakehouse, and DirectLake Power BI semantic models.
4. P6 Schedule AI Automation — reads a project schedule, computes verified facts, and uses an AI layer to auto-write the project-controls narrative as a PDF.
5. Database Query Optimisation — restructured schemas, partitioned large tables, and tuned SQL Server queries, cutting response times by 65%.`;

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

  // ── Laura (Groq / LLaMA) Chat API ────────────────────────────────
  // Secure proxy to Groq. The API key lives only in the server-side
  // GQ_API_KEY env var and is never exposed to the browser. If anything
  // fails, the front-end falls back to its built-in responses.
  router.post("/chat", async (req, res) => {
    const key = process.env.GQ_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "Assistant not configured: GQ_API_KEY is missing from .env" });
    }

    const message = (req.body?.message ?? "").toString().slice(0, 1000);
    if (!message.trim()) {
      return res.status(400).json({ error: "Empty message" });
    }

    const history = Array.isArray(req.body?.history)
      ? req.body.history
          .slice(-8)
          .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .map((m: any) => ({ role: m.role, content: m.content.toString().slice(0, 1000) }))
      : [];

    const messages = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: message },
    ];

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 350,
          temperature: 0.6,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API error:", errorText);
        return res.status(502).json({ error: "Upstream error", detail: errorText.slice(0, 200) });
      }

      const data = await response.json() as any;
      const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
      if (!reply) {
        return res.status(502).json({ error: "Empty reply" });
      }
      res.json({ reply });
    } catch (error) {
      console.error("Groq fetch error:", error);
      res.status(502).json({ error: "Failed to reach Groq API" });
    }
  });

  // Mount the router at both paths to support local dev and Netlify functions
  app.use("/api", router);
  app.use("/.netlify/functions/api", router);

  return app;
}
