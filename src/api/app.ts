import express, { Express } from "express";
import cors from "cors";

import authRouterBuilder from "./routes/authentication.routes";
import DependencyContainer from "./dependency.container";
import AuthenticationController from "./controllers/authentication.controller";
import labelsRouterBuilder from "./routes/labels.routes";
import LabelsController from "./controllers/labels.controller";

const app: Express = express();

// Middlewares...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true })); // Allow all origins

// Routes...
app.get("/", (req, res) => {
  res.send("Hello from local server...!");
});

app.get("/health", (req, res) => {
  res.send("Server is healthy...!");
});

const container = DependencyContainer.getInstance().initialize().getContainer();
app.use("/api", authRouterBuilder(container.get(AuthenticationController)));
app.use("/api", labelsRouterBuilder(container.get(LabelsController)));

export default app;
