
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
    origin: [
      "http://localhost:5173",
      "https://ai-interview-s9rr.onrender.com",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.text({
    type: ["application/sdp", "text/plain"],
  })
);

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
  ScrapeRoutes
);

app.use("/start", InterviweRoutes);

// Frontend production build directory
const frontendPath = path.join(__dirname, "../frontend/ai-interview/dist");

// Serve frontend static files
app.use(express.static(frontendPath));

// React Router fallback
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      console.error("Frontend index.html not found:", err);

      if (!res.headersSent) {
        res.status(500).send(
          "Frontend build not found. Please check the Render build command."
        );
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", async () => {
  try {
    await connectdb();

    console.log("MongoDB connected successfully");
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend directory: ${frontendPath}`);
  } catch (error) {
    console.error("Database connection error:", error);
  }
});
