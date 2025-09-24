
import express, { Express } from "express";
import cors from "cors";
import FirebaseConfig, { Task } from "../infrastructure/firebase.config";

const app: Express = express();

// Middlewares...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true })); // Allow all origins

// Routes...
app.get("/", (req, res) => {
  res.send("Hello from local server...!");
});

app.post("/tasks", async (req, res) => {
  const collection = FirebaseConfig.getInstance().getTasksCollection();
  const newTask = req.body;
  try {
    const docRef = await collection.add(newTask as Task);
    res.status(201).send({ id: docRef.id });
  } catch (error) {
    console.error("Error adding document: ", error);
    res.status(500).send({ error: "Failed to create task" });
  }
});

app.get("/tasks", async (req, res) => {
  const collection = FirebaseConfig.getInstance().getTasksCollection();
  try {
    const snapshot = await collection.get();
    const tasks = snapshot.docs.map((doc) => doc.data());
    console.log("Retrieved tasks:", tasks.length);
    res.status(200).send(tasks);
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve tasks" });
  }
});

app.get("/health", (req, res) => {
  res.send("Server is healthy...!");
});

export default app;
