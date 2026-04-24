import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import * as promClient from "prom-client";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestsTotal = new promClient.Counter({
  name: "todo_app_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

const activeUsers = new promClient.Gauge({
  name: "todo_app_active_users",
  help: "Number of active users",
});

const todosCreated = new promClient.Counter({
  name: "todo_app_todos_created_total",
  help: "Total number of todos created",
});

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("/health", (req, res) => {
  res.status(200).send("healthy\n");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.post("/api/todos", express.json(), (req, res) => {
  todosCreated.inc();
  activeUsers.inc();
  res.json({ message: "Todo created" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = Number(process.env.PORT) || 8082;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Metrics: http://localhost:${PORT}/metrics`);
});
