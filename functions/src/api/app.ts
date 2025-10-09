import express, { Express } from "express";
import cors from "cors";

import Environment from "../environment";

import authRouterBuilder from "./routes/authentication.routes";
import { globalErrorHandler } from "./middlewares/global-error-handler.middleware";
import DependencyContainer from "./dependency.container";
import AuthenticationController from "./controllers/authentication.controller";
import labelsRouterBuilder from "./routes/labels.routes";
import LabelsController from "./controllers/labels.controller";
import tasksRouterBuilder from "./routes/tasks.routes";
import TasksController from "./controllers/tasks.controller";

const environment = Environment.getInstance();
const app: Express = express();

// Middlewares...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: environment.CORS_ORIGIN }));

// Routes...
app.get("/", (req, res) => {
  const envName = environment.NODE_ENV;
  res.send(`Hello from deployed server in ${envName} environment...!`);
});

app.get("/health", (req, res) => {
  res.send("Server is healthy...!");
});

const container = DependencyContainer.getInstance().initialize().getContainer();
app.use("/api", authRouterBuilder(container.get(AuthenticationController)));
app.use("/api", labelsRouterBuilder(container.get(LabelsController)));
app.use("/api", tasksRouterBuilder(container.get(TasksController)));

// Global error handler (should be last middleware)
app.use(globalErrorHandler);

export default app;
