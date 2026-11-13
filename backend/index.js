import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "node:dns";

import { connectdb } from "./dbconnect.js";
import ScrapeRoutes from "./src/Routes/Scrapping.js";
import AuthRoutes from "./src/Routes/AuthRoutes.js";
import InterviweRoutes from "./src/Routes/Interview.js";

dotenv.config();

export const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://ai-interview-linksaver.vercel.app",
      ];

      // Allow your Vercel project preview deployments
      const isVercelPreview =
        /^https:\/\/ai-interview-[a-z0-9-]+-linksaver\.vercel\.app$/.test(
          origin || "",
        );

      if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use(
  express.text({
    type: ["application/sdp", "text/plain"],
  }),
);

// DNS configuration
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// API Routes
app.use("/auth", AuthRoutes);
app.use("/scrape", ScrapeRoutes);
app.use("/start", InterviweRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "AI Interview Backend is running",
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await connectdb();
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
});
