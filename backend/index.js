import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectdb } from "./dbconnect.js";
import dns from "node:dns";
import ScrapeRoutes from "./src/Routes/Scrapping.js";
import AuthRoutes from "./src/Routes/AuthRoutes.js";
import InterviweRoutes from "./src/Routes/Interview.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-render-app.onrender.com"],
  }),
);

app.use(express.json());
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

// DNS configuration
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// API Routes
app.use("/auth", AuthRoutes);

app.use(
  "/scrape",
  (req, res, next) => {
    console.log("Scrape route reached:", req.method, req.originalUrl);
    next();
  },
  ScrapeRoutes,
);

app.use("/start", InterviweRoutes);

const sessionConfig = JSON.stringify({
  type: "realtime",
  model: "gpt-realtime-2.1",
  audio: {
    output: { voice: "marin" },
  },
});

// Serve React frontend
app.use(express.static(path.join(__dirname, "../frontend/ai-interview/dist")));

// React routing fallback
app.get("/{*splat}", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/ai-interview/dist/index.html"),
  );
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", async () => {
  try {
    await connectdb();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.log("Database connection error:", error);
  }
});
