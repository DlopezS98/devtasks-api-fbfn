
import express, { Express } from "express";
import cors from "cors";

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

export default app;
