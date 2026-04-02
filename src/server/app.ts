import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

export function createExpressApp() {
  const app = express();

  app.use(express.json());
  app.use(cors());

  // Debug route to check if GOOGLE_APPS_SCRIPT_URL is set
  app.get("/api/debug-env", (req, res) => {
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    res.json({
      scriptUrlSet: !!scriptUrl,
      scriptUrlPrefix: scriptUrl ? scriptUrl.substring(0, 25) + "..." : "not set",
      nodeEnv: process.env.NODE_ENV
    });
  });

  // API Route for Inquiry Form (Proxy to Google Apps Script)
  app.post("/api/inquiry", async (req, res) => {
    const { name, email, message, type, project } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!scriptUrl) {
      console.error("GOOGLE_APPS_SCRIPT_URL is not defined in environment variables.");
      return res.status(500).json({ error: "Google Apps Script URL is not configured" });
    }

    try {
      console.log(`Submitting ${type || 'inquiry'} to Google Apps Script...`);
      const response = await axios.post(scriptUrl, {
        name,
        email,
        message,
        type: type || "inquiry",
        project: project || "N/A",
        timestamp: new Date().toISOString()
      }, {
        headers: { "Content-Type": "application/json" },
        maxRedirects: 5
      });

      if (response.status === 200) {
        res.status(200).json({ success: true, message: "Submitted successfully!" });
      } else {
        console.error("Apps Script Error Response Status:", response.status);
        res.status(500).json({ error: "Failed to submit to Apps Script" });
      }
    } catch (error: any) {
      console.error("Error submitting to Google Apps Script:", error.message);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
      res.status(500).json({ error: "Failed to submit. Please try again later." });
    }
  });

  // API Route to fetch projects from GitHub
  app.get("/api/projects", async (req, res) => {
    const githubUsername = "akhilkarthik";
    try {
      const response = await axios.get(`https://api.github.com/users/${githubUsername}/repos`, {
        params: {
          sort: "updated",
          per_page: 100
        }
      });
      
      const repos = response.data;
      
      // Transform GitHub repos into project format
      const githubProjects = repos
        .filter((repo: any) => !repo.fork && repo.description) // Only original repos with descriptions
        .map((repo: any) => ({
          id: repo.name,
          title: repo.name.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          category: repo.language || 'Project',
          description: repo.description || 'No description available.',
          image: `https://opengraph.githubassets.com/1/${githubUsername}/${repo.name}`,
          year: new Date(repo.created_at).getFullYear().toString(),
          tags: repo.topics && repo.topics.length > 0 ? repo.topics : [repo.language].filter(Boolean),
          link: repo.html_url
        }));

      res.status(200).json(githubProjects);
    } catch (error: any) {
      console.error("Error fetching GitHub projects:", error.message);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // API Route to fetch data from Google Sheets (via Apps Script)
  app.get("/api/data", async (req, res) => {
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!scriptUrl) {
      return res.status(500).json({ error: "Google Apps Script URL is not configured" });
    }

    try {
      const response = await axios.get(scriptUrl, {
        params: { action: "getData" }
      });

      if (response.status === 200) {
        res.status(200).json(response.data);
      } else {
        console.error("Apps Script Fetch Error Status:", response.status);
        res.status(500).json({ error: "Failed to fetch data from Apps Script" });
      }
    } catch (error: any) {
      console.error("Error fetching from Google Apps Script:", error.message);
      res.status(500).json({ error: "Failed to fetch data. Please try again later." });
    }
  });

  return app;
}
