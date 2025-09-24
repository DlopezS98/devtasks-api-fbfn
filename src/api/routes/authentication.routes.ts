import { Router } from "express";
import AuthenticationController from "@Api/controllers/authentication.controller";

const authRouterBuilder = (controller: AuthenticationController) => {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.post("/login", controller.loginAsync.bind(controller));
  router.post("/register", controller.registerAsync.bind(controller));
  return router;
};

export default authRouterBuilder;
