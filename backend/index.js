import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectdb } from "./dbconnect.js"
import dns from "node:dns";
import ScrapeRoutes from "./src/Routes/Scrapping.js";
import AuthRoutes from "./src/Routes/AuthRoutes.js"
import InterviweRoutes from "./src/Routes/Interview.js"
export const app = express();
dotenv.config();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.text({ type: ["application/sdp", "text/plain"] }));
/////githubscrape
dns.setServers(["8.8.8.8", "8.8.4.4"]);
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
  audio: { output: { voice: "marin" } },
});
// An endpoint which creates a Realtime API session.
app.listen(3000, async() => {
  try {
    await connectdb();
    console.log("Server running at http://localhost:3000");
  } catch (error) {
    console.log(error);
  }
});
