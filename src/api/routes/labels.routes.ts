import { RequestHandler, Router } from "express";
import LabelsController from "@Api/controllers/labels.controller";

const labelsRouterBuilder = (controller: LabelsController) => {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.post(
    "/labels",
    ...controller.getMiddlewares(),
    controller.createAsync.bind(controller) as unknown as RequestHandler,
  );
  router.get(
    "/labels",
    ...controller.getMiddlewares(),
    controller.listAsync.bind(controller) as unknown as RequestHandler,
  );
  router.delete(
    "/labels/:id",
    ...controller.getMiddlewares(),
    controller.deleteAsync.bind(controller) as unknown as RequestHandler,
  );
  router.put(
    "/labels/:id",
    ...controller.getMiddlewares(),
    controller.updateAsync.bind(controller) as unknown as RequestHandler,
  );
  return router;
};

export default labelsRouterBuilder;
