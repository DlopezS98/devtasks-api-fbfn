import { Router } from "express";
import LabelsController from "@Api/controllers/labels.controller";

const labelsRouterBuilder = (controller: LabelsController) => {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.post("/labels", controller.createAsync.bind(controller));
  router.get("/labels", controller.listAsync.bind(controller));
  router.delete("/labels/:id", controller.deleteAsync.bind(controller));
  return router;
};

export default labelsRouterBuilder;
