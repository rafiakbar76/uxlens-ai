import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import formidable from "formidable";
import fs from "fs/promises";
import { analyzeImage, analyzeReviews, analyzePage } from "./src/lib/ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// ================= CORS (FIX WAJIB) =================
app.use(cors({
  origin: true, // allow all (biar ga ribet di Railway + Vercel)
  credentials: true
}));

app.options("*", cors());

// ================= MIDDLEWARE =================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

console.log("Environment variables loaded:");
console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "SET" : "NOT SET");

// ================= API =================
app.post("/api/analyze", async (req, res) => {
  try {
    const contentType = req.headers["content-type"] || "";
    console.log("Content-Type:", contentType);

    let reviews = null;
    let url = null;
    let imageData = null;
    let context = "";

    // ===== HANDLE INPUT =====
    if (contentType.includes("multipart/form-data")) {
      const form = formidable({ multiples: false });
      const [fields, files] = await form.parse(req);

      context = fields.context?.[0] || "";
      const uploadedFile = files.file?.[0];

      if (uploadedFile) {
        const buffer = await fs.readFile(uploadedFile.filepath);
        imageData = buffer.toString("base64");
      }
    } else {
      const body = req.body || {};
      reviews = body.reviews;
      url = body.url;
      context = body.context || "";
    }

    // ===== VALIDASI =====
    if (!reviews && !url && !imageData) {
      return res.status(400).json({
        error: "Missing input: provide 'reviews', 'url', or upload an image",
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key not found",
      });
    }

    // ===== CALL AI =====
    let insight;

    if (reviews) {
      insight = await analyzeReviews(apiKey, reviews);
    } else if (imageData) {
      insight = await analyzeImage(apiKey, imageData, context);
    } else {
      insight = await analyzePage(apiKey, url, context);
    }

    return res.json(insight);

  } catch (error) {
    console.error("API ERROR:", error);

    // fallback supaya frontend tidak crash
    return res.status(200).json({
      summary: "Fallback analysis",
      findings: "AI temporarily unavailable (rate limit / no credits)",
      checklist: "Try again later or use your own API key"
    });
  }
});

// ================= PRODUCTION =================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API route not found" });
    }
    res.sendFile(path.join(__dirname, "dist/index.html"));
  });
}

// ================= START SERVER =================
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
