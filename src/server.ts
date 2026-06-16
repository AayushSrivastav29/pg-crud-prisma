import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import prisma from "./lib/prisma";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import benchmarkRoutes from "./routes/benchmarkRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/benchmark", benchmarkRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", database: "connected" });
});

// Serve frontend in production (optional, we can build later if needed)
// app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Start Server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Express Server is running on http://localhost:${PORT}`);
  console.log(`👉 API Docs/Endpoints:`);
  console.log(`   - Users:     GET/POST/PUT/DELETE  http://localhost:${PORT}/api/users`);
  console.log(`   - Posts:     GET/POST/PUT/DELETE  http://localhost:${PORT}/api/posts`);
  console.log(`   - Benchmark: POST (run benchmark) http://localhost:${PORT}/api/benchmark/run`);
  console.log(`                GET (stats)          http://localhost:${PORT}/api/benchmark/stats`);
  console.log(`                GET/DELETE (history) http://localhost:${PORT}/api/benchmark/history\n`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down server...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server stopped.");
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down server...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server stopped.");
    process.exit(0);
  });
});
