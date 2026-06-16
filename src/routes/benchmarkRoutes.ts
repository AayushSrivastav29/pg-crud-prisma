import { Router } from "express";
import {
  getStats,
  getHistory,
  clearHistory,
  runBenchmark
} from "../controllers/benchmarkController";

const router = Router();

router.get("/stats", getStats);
router.get("/history", getHistory);
router.delete("/history", clearHistory);
router.post("/run", runBenchmark);

export default router;
