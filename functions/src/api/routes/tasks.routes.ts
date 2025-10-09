import { RequestHandler, Router } from "express";
import TasksController from "@Api/controllers/tasks.controller";

const tasksRouterBuilder = (controller: TasksController) => {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.post(
    "/tasks",
    ...controller.getMiddlewares(),
    controller.createAsync.bind(controller) as unknown as RequestHandler,
  );

  router.get(
    "/tasks",
    ...controller.getMiddlewares(),
    controller.searchTasksAsync.bind(controller) as unknown as RequestHandler,
  );

  router.get(
    "/tasks/:taskId",
    ...controller.getMiddlewares(),
    controller.getTaskByIdAsync.bind(controller) as unknown as RequestHandler,
  );

  router.post(
    "/tasks/:taskId/labels/:labelId",
    ...controller.getMiddlewares(),
    controller.addLabelAsync.bind(controller) as unknown as RequestHandler,
  );

  router.delete(
    "/tasks/:taskId/labels/:labelId",
    ...controller.getMiddlewares(),
    controller.removeLabelAsync.bind(controller) as unknown as RequestHandler,
  );

  router.delete(
    "/tasks/:taskId",
    ...controller.getMiddlewares(),
    controller.deleteAsync.bind(controller) as unknown as RequestHandler,
  );

  router.patch(
    "/tasks/:taskId",
    ...controller.getMiddlewares(),
    controller.updateAsync.bind(controller) as unknown as RequestHandler,
  );

  return router;
};

export default tasksRouterBuilder;
