import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import formidable from "formidable";
import fs from "fs/promises";
import { analyzeImage, analyzeReviews } from './src/lib/ai.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration for Vercel frontend
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'http://localhost:3000', // Alternative local
    'https://uxlens-ai-ochre.vercel.app', // Vercel production
    /\.vercel\.app$/, // Any Vercel domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Preflight request handler
app.options('*', cors(corsOptions));

console.log("Environment variables loaded:");
console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "SET" : "NOT SET");

// ================= API =================
app.post("/api/analyze", async (req, res) => {
  try {
    const contentType = req.headers["content-type"] || "";
    console.log("Content-Type:", contentType);

    let reviews = null;
    let imageData = null;
    let context = "";

    // ================= HANDLE INPUT TYPES =================
    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const form = formidable({ multiples: false });
      const [fields, files] = await form.parse(req);

      context = fields.context?.[0] || "";
      const uploadedFile = files.file?.[0];

      if (uploadedFile) {
        const buffer = await fs.readFile(uploadedFile.filepath);
        imageData = buffer.toString("base64");
        console.log("Image received, size:", imageData.length);
      }
    } else {
      // Handle JSON input
      const body = req.body || {};
      reviews = body.reviews;
      context = body.context || "";
    }

    // ================= VALIDATION =================
    if (!reviews && !url && !imageData) {
      return res.status(400).json({
        error: "Missing input: provide 'reviews' or upload an image",
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key not found",
      });
    }

    // ================= CALL AI =================
    let insight;
    if (reviews) {
      insight = await analyzeReviews(apiKey, reviews);
    } else if (imageData) {
      insight = await analyzeImage(apiKey, imageData, context);
    } else {
      return res.status(400).json({
        error: "Only reviews and images are supported",
      });
    }

    return res.json(insight);

  } catch (error) {
    console.error("API ERROR:", error);

    let errorMessage = error.message || 'Internal server error'
    if (error.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again in a few minutes, or consider getting your own OpenRouter API key for higher limits.'
    }

    return res.status(error.status || 500).json({
      error: errorMessage,
    });
  }
});

// ================= PRODUCTION =================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
