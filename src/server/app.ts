import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

const MEDIUM_FEED_URL = "https://medium.com/feed/@karthikakhil.in";
const MEDIUM_PROXY_FEED_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(MEDIUM_FEED_URL)}`;
const MEDIUM_RSS_JSON_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED_URL)}`;

const PERSONAL_FEED_URL = "https://medium.com/feed/@akhilkarthik";
const PERSONAL_PROXY_FEED_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(PERSONAL_FEED_URL)}`;
const PERSONAL_RSS_JSON_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(PERSONAL_FEED_URL)}`;

const BLOG_CACHE_TTL_MS = 15 * 60 * 1000;

let blogCache: { posts: ReturnType<typeof normalizeMediumItem>[]; source: string; updatedAt: number } | null = null;
let personalBlogCache: { posts: ReturnType<typeof normalizeMediumItem>[]; source: string; updatedAt: number } | null = null;

// ── GitHub project auto-discovery ────────────────────────────────────
const GITHUB_USERNAME = "akhilkarthik";
const REPOS_CACHE_TTL_MS = 15 * 60 * 1000;

let reposCache: { repos: any[]; updatedAt: number } | null = null;

function githubHeaders(accept: string) {
  return {
    Accept: accept,
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleCase(name: string) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchGithubRepos() {
  if (reposCache && Date.now() - reposCache.updatedAt < REPOS_CACHE_TTL_MS) {
    return reposCache.repos;
  }

  const response = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
    { headers: githubHeaders("application/vnd.github.v3+json") }
  );

  if (!response.ok) {
    throw new Error(`GitHub repos fetch failed: ${response.status}`);
  }

  const allRepos = await response.json();
  const repos = (Array.isArray(allRepos) ? allRepos : []).filter(
    (r: any) => !r.fork && !r.private && !r.archived && r.description && r.description.trim().length > 0
  );

  reposCache = { repos, updatedAt: Date.now() };
  return repos;
}

function repoToProject(repo: any) {
  return {
    id: slugify(repo.name),
    title: titleCase(repo.name),
    category: repo.language || "Project",
    description: repo.description || "No description provided yet.",
    image: `https://opengraph.githubassets.com/1/${repo.full_name}`,
    year: String(new Date(repo.created_at).getFullYear()),
    tags: repo.topics && repo.topics.length > 0 ? repo.topics : repo.language ? [repo.language] : [],
    link: repo.html_url,
  };
}

async function fetchRepoReadme(repoPath: string) {
  const response = await fetch(`https://api.github.com/repos/${repoPath}/readme`, {
    headers: githubHeaders("application/vnd.github.v3.raw"),
  });

  if (!response.ok) return null;
  return response.text();
}

type MediumRssItem = {
  title?: string | { "#text"?: string; "__cdata"?: string };
  link?: string;
  guid?: string | { "#text"?: string };
  pubDate?: string;
  "dc:creator"?: string | { "#text"?: string; "__cdata"?: string };
  category?: string | { "#text"?: string; "__cdata"?: string } | Array<string | { "#text"?: string; "__cdata"?: string }>;
  description?: string | { "#text"?: string; "__cdata"?: string };
  "content:encoded"?: string | { "#text"?: string; "__cdata"?: string };
  "media:thumbnail"?: { "@_url"?: string };
};

type RssJsonItem = {
  title?: string;
  pubDate?: string;
  link?: string;
  guid?: string;
  author?: string;
  thumbnail?: string;
  description?: string;
  content?: string;
  categories?: string[];
};

function rssText(value?: string | { "#text"?: string; "__cdata"?: string }) {
  if (!value) return "";
  return typeof value === "string" ? value : value.__cdata || value["#text"] || "";
}

function decodeHtmlEntities(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function stripHtml(html = "") {
  return decodeHtmlEntities(html.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim());
}

function getThumbnail(item: MediumRssItem) {
  if (item["media:thumbnail"]?.["@_url"]) {
    return item["media:thumbnail"]["@_url"];
  }

  const content = rssText(item["content:encoded"]) || rssText(item.description);
  const imageMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imageMatch?.[1] || "";
}

function normalizeMediumItem(item: MediumRssItem) {
  const title = decodeHtmlEntities(rssText(item.title) || "Untitled");
  const content = rssText(item["content:encoded"]) || rssText(item.description);
  const description = rssText(item.description) || stripHtml(content).slice(0, 180);
  const categories = Array.isArray(item.category)
    ? item.category.map(rssText).filter(Boolean)
    : item.category
      ? [rssText(item.category)].filter(Boolean)
      : [];

  return {
    title,
    pubDate: item.pubDate || "",
    link: item.link || "",
    guid: typeof item.guid === "string" ? item.guid : item.guid?.["#text"] || item.link || title,
    author: rssText(item["dc:creator"]) || "Akhil Karthik",
    thumbnail: getThumbnail(item),
    description,
    content,
    categories,
  };
}

function normalizeRssJsonItem(item: RssJsonItem) {
  const content = item.content || item.description || "";

  return {
    title: decodeHtmlEntities(item.title || "Untitled"),
    pubDate: item.pubDate || "",
    link: item.link || "",
    guid: item.guid || item.link || item.title || "",
    author: item.author || "Akhil Karthik",
    thumbnail: item.thumbnail || "",
    description: item.description || stripHtml(content).slice(0, 180),
    content,
    categories: item.categories || [],
  };
}

async function fetchMediumPostsFromFeed() {
  return fetchMediumPostsFromXmlUrl(MEDIUM_FEED_URL, "Medium feed returned");
}

async function fetchMediumPostsFromProxiedFeed() {
  return fetchMediumPostsFromXmlUrl(MEDIUM_PROXY_FEED_URL, "Medium proxy feed returned");
}

async function fetchMediumPostsFromXmlUrl(url: string, errorPrefix: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "User-Agent": "Mozilla/5.0 Akhil-Karthik-Portfolio/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`${errorPrefix} ${response.status}`);
  }

  const xml = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: "__cdata",
  });
  const parsed = parser.parse(xml);
  const items = parsed?.rss?.channel?.item;
  return (Array.isArray(items) ? items : items ? [items] : []).map(normalizeMediumItem);
}

async function fetchMediumPostsFromRssJson() {
  const response = await fetch(MEDIUM_RSS_JSON_URL);

  if (!response.ok) {
    throw new Error(`RSS JSON fallback returned ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== "ok" || !Array.isArray(data.items)) {
    throw new Error("RSS JSON fallback returned an invalid response");
  }

  return data.items.map(normalizeRssJsonItem);
}

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
4. Database Query Optimisation — restructured schemas, partitioned large tables, and tuned SQL Server queries, cutting response times by 65%.`;

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

  // API Route for Projects — auto-discovers all public GitHub repos
  router.get("/projects", async (req, res) => {
    try {
      const repos = await fetchGithubRepos();
      res.status(200).json(repos.map(repoToProject));
    } catch (error) {
      console.error("Error fetching GitHub repos:", error);
      res.status(200).json([]);
    }
  });

  // API Route for a single project (curated or auto-discovered) + its README
  router.get("/project/:id", async (req, res) => {
    const { id } = req.params;
    const { PROJECTS } = await import("../constants-data");
    let project: any = PROJECTS.find((p: any) => p.id === id);

    if (!project) {
      try {
        const repos = await fetchGithubRepos();
        const match = repos.find((r: any) => slugify(r.name) === id);
        if (match) project = repoToProject(match);
      } catch (error) {
        console.error("Error resolving project from GitHub:", error);
      }
    }

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    let readme: string | null = null;
    try {
      const repoPath = new URL(project.link).pathname.replace(/^\//, "");
      readme = await fetchRepoReadme(repoPath);
    } catch (error) {
      console.error("Error fetching README:", error);
    }

    res.status(200).json({ project, readme });
  });

  // API Route for Blogs (fetched live from Medium RSS)
  router.get("/blogs", async (req, res) => {
    if (blogCache && Date.now() - blogCache.updatedAt < BLOG_CACHE_TTL_MS) {
      return res.status(200).json({
        posts: blogCache.posts,
        source: blogCache.source,
        cached: true,
      });
    }

    const providers = [
      { source: "medium-rss", fetchPosts: fetchMediumPostsFromFeed },
      { source: "proxied-medium-rss", fetchPosts: fetchMediumPostsFromProxiedFeed },
      { source: "rss2json", fetchPosts: fetchMediumPostsFromRssJson },
    ];

    const errors: string[] = [];

    for (const provider of providers) {
      try {
        const posts = await provider.fetchPosts();

        if (posts.length > 0) {
          blogCache = { posts, source: provider.source, updatedAt: Date.now() };
          return res.status(200).json({ posts, source: provider.source, cached: false });
        }

        errors.push(`${provider.source}: no posts returned`);
      } catch (error) {
        console.warn(`Medium blog provider failed (${provider.source}):`, error);
        errors.push(`${provider.source}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (blogCache) {
      return res.status(200).json({
        posts: blogCache.posts,
        source: blogCache.source,
        cached: true,
        stale: true,
      });
    }

    res.status(502).json({ error: "Unable to fetch Medium posts", details: errors });
  });

  // API Route for Personal Blogs (fetched from personal Medium RSS)
  router.get("/blogs/personal", async (req, res) => {
    if (personalBlogCache && Date.now() - personalBlogCache.updatedAt < BLOG_CACHE_TTL_MS) {
      return res.status(200).json({
        posts: personalBlogCache.posts,
        source: personalBlogCache.source,
        cached: true,
      });
    }

    const providers = [
      { source: "personal-medium-rss", fetchPosts: () => fetchMediumPostsFromXmlUrl(PERSONAL_FEED_URL, "Personal Medium feed returned") },
      { source: "personal-proxied-medium-rss", fetchPosts: () => fetchMediumPostsFromXmlUrl(PERSONAL_PROXY_FEED_URL, "Personal Medium proxy feed returned") },
      { source: "personal-rss2json", fetchPosts: async () => {
        const response = await fetch(PERSONAL_RSS_JSON_URL);
        if (!response.ok) throw new Error(`Personal RSS JSON fallback returned ${response.status}`);
        const data = await response.json();
        if (data.status !== "ok" || !Array.isArray(data.items)) throw new Error("Personal RSS JSON fallback returned an invalid response");
        return data.items.map(normalizeRssJsonItem);
      }},
    ];

    const errors: string[] = [];

    for (const provider of providers) {
      try {
        const posts = await provider.fetchPosts();
        if (posts.length > 0) {
          personalBlogCache = { posts, source: provider.source, updatedAt: Date.now() };
          return res.status(200).json({ posts, source: provider.source, cached: false });
        }
        errors.push(`${provider.source}: no posts returned`);
      } catch (error) {
        console.warn(`Personal blog provider failed (${provider.source}):`, error);
        errors.push(`${provider.source}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (personalBlogCache) {
      return res.status(200).json({
        posts: personalBlogCache.posts,
        source: personalBlogCache.source,
        cached: true,
        stale: true,
      });
    }

    res.status(502).json({ error: "Unable to fetch personal Medium posts", details: errors });
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
