import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getStats = async (req: Request, res: Response) => {
  try {
    const [users, posts, comments, categories, tags] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.category.count(),
      prisma.tag.count(),
    ]);

    res.json({
      users,
      posts,
      comments,
      categories,
      tags,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const history = await prisma.performanceRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const clearHistory = async (req: Request, res: Response) => {
  try {
    await prisma.performanceRun.deleteMany();
    res.json({ message: "History cleared successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const runBenchmark = async (req: Request, res: Response) => {
  try {
    const delay = parseInt(req.body.delay as string) || 100; // in milliseconds
    const queriesCount = parseInt(req.body.queries as string) || 4; // number of queries

    if (delay < 0 || delay > 2000) {
      return res
        .status(400)
        .json({ error: "Delay must be between 0 and 2000ms" });
    }
    if (queriesCount < 1 || queriesCount > 20) {
      return res
        .status(400)
        .json({ error: "Queries count must be between 1 and 20" });
    }

    // Helper: Create delay promise
    const createDelay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // ─── SERIAL EXECUTION ─────────────────────────────────────────────────────
    const serialTimeline: any[] = [];
    const serialStart = Date.now();

    for (let i = 0; i < queriesCount; i++) {
      const qStart = Date.now();
      await createDelay(delay); // Use JavaScript timer instead of pg_sleep
      const qEnd = Date.now();
      serialTimeline.push({
        queryId: i + 1,
        startedAt: qStart - serialStart,
        durationMs: qEnd - qStart,
        endedAt: qEnd - serialStart,
      });
    }
    const serialDuration = Date.now() - serialStart;

    // ─── PARALLEL EXECUTION ───────────────────────────────────────────────────
    const parallelTimeline: any[] = [];
    const parallelStart = Date.now();

    const parallelPromises = Array.from({ length: queriesCount }).map(
      async (_, i) => {
        const qStart = Date.now();
        await createDelay(delay); // Use JavaScript timer instead of pg_sleep
        const qEnd = Date.now();
        parallelTimeline.push({
          queryId: i + 1,
          startedAt: qStart - parallelStart,
          durationMs: qEnd - qStart,
          endedAt: qEnd - parallelStart,
        });
      },
    );

    await Promise.all(parallelPromises);
    const parallelDuration = Date.now() - parallelStart;

    // Sort timeline items by queryId
    parallelTimeline.sort((a, b) => a.queryId - b.queryId);

    // Save benchmark run
    const savedRun = await prisma.performanceRun.create({
      data: {
        simulatedDelay: delay,
        queryCount: queriesCount,
        serialTimeMs: serialDuration,
        parallelTimeMs: parallelDuration,
      },
    });

    const speedup = (serialDuration / parallelDuration).toFixed(2);

    res.json({
      summary: {
        delay,
        queriesCount,
        serialDurationMs: serialDuration,
        parallelDurationMs: parallelDuration,
        speedupFactor: parseFloat(speedup),
        savedRunId: savedRun.id,
      },
      serialTimeline,
      parallelTimeline,
    });
  } catch (error: any) {
    console.error("Benchmark controller error:", error);
    res.status(500).json({ error: error.message });
  }
};
