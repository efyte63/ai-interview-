import { Router } from "express";

import { register, login, getme } from "../controller/Auth.controller.js";

import { authmiddleware } from "../middlewares/userAuthMiddleware.js";

const routes = Router();

routes.post("/register", register);
routes.post("/login", login);
routes.get("/getme", authmiddleware, getme);

export default routes;
