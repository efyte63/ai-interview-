import { Router } from "express";
import { interviewsession } from "../controller/interview.controller.js";
import { authmiddleware } from "../middlewares/userAuthMiddleware.js";

const routes = Router();

routes.post("/session", authmiddleware, interviewsession);

export default routes;
