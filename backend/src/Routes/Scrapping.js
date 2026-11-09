import { Router } from "express";
import multer from "multer";

import { githubscrape, resumescrape } from "../controller/Scrape.controller.js";

import { authmiddleware } from "../middlewares/userAuthMiddleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});
const routes = Router();
routes.post("/github/:github", authmiddleware, githubscrape);
routes.post("/resume", authmiddleware, upload.single("resume"), resumescrape);
export default routes;
