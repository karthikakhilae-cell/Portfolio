// Netlify serverless function: secure proxy to Groq (Llama) for the portfolio assistant.
// The API key lives only in the Netlify environment variable GQ_API_KEY and is never
// exposed to the browser. If anything fails, the front-end falls back to its built-in
// responses, so a visitor never sees an error.

const SYSTEM_PROMPT = `You are "Laura", the friendly AI assistant on Akhil Karthik's portfolio website. You answer questions from recruiters and visitors about Akhil. Keep replies short, warm and conversational (2-4 sentences), and end with a relevant follow-up question to keep the chat going. Only discuss Akhil and his work. Never invent facts, numbers, or projects — if you don't know, say so and offer what you do know.

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

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const key = process.env.GQ_API_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: "Assistant not configured" }) };
  }

  let history = [];
  let message = "";
  try {
    const body = JSON.parse(event.body || "{}");
    message = (body.message || "").toString().slice(0, 1000);
    if (Array.isArray(body.history)) {
      history = body.history.slice(-8)
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m) => ({ role: m.role, content: m.content.toString().slice(0, 1000) }));
    }
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Bad request" }) };
  }

  if (!message.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: "Empty message" }) };
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 350,
        temperature: 0.6,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return { statusCode: 502, body: JSON.stringify({ error: "Upstream error", detail: detail.slice(0, 200) }) };
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";
    if (!reply) {
      return { statusCode: 502, body: JSON.stringify({ error: "Empty reply" }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: "Request failed" }) };
  }
};
