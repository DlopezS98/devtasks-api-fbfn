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
  // Add more routes (list, delete, update) as needed
  return router;
};

export default tasksRouterBuilder;
