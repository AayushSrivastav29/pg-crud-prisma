<template>
  <div>
    <!-- Schema Stats Ribbon -->
    <div style="margin-bottom: 24px">
      <h2
        style="
          margin: 0 0 16px 0;
          font-family: var(--font-heading);
          font-size: 28px;
          font-weight: 700;
          color: #f1f5f9;
        "
      >
        Performance Dashboard
      </h2>

      <a-row :gutter="16">
        <a-col :span="4" v-for="stat in statCards" :key="stat.label">
          <a-card
            class="premium-card"
            :body-style="{ padding: '16px', textAlign: 'center' }"
            :bordered="false"
          >
            <div
              style="
                color: #94a3b8;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              "
            >
              {{ stat.label }}
            </div>
            <div
              class="glowing-number"
              style="font-size: 28px; margin-top: 4px"
            >
              {{ stat.value }}
            </div>
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card
            class="premium-card"
            :body-style="{ padding: '16px', textAlign: 'center' }"
            :bordered="false"
            style="border: 1px solid rgba(244, 63, 94, 0.2)"
          >
            <div
              style="
                color: #f43f5e;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              "
            >
              Benchmark Runs
            </div>
            <div
              class="glowing-number-rose"
              style="font-size: 28px; margin-top: 4px"
            >
              {{ history.length }}
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- Benchmarking Interactive Card -->
    <a-row :gutter="24" style="margin-bottom: 24px">
      <a-col :span="10">
        <a-card
          title="Benchmark Parameters"
          class="premium-card"
          :bordered="false"
          style="height: 100%"
        >
          <template #extra>
            <a-tooltip
              title="Simulated delay replicates slow queries using pg_sleep, showing performance differences clearly."
            >
              <span style="color: #6366f1; cursor: help; font-size: 13px"
                >What is this?</span
              >
            </a-tooltip>
          </template>

          <a-form layout="vertical">
            <a-form-item label="Simulated Query Delay (ms)">
              <div style="display: flex; align-items: center; gap: 12px">
                <a-slider
                  v-model:value="delay"
                  :min="10"
                  :max="500"
                  :step="10"
                  style="flex-grow: 1"
                />
                <a-input-number
                  v-model:value="delay"
                  :min="10"
                  :max="500"
                  style="width: 80px"
                />
              </div>
              <span style="font-size: 11px; color: #64748b">
                Simulates execution delay per database query.
              </span>
            </a-form-item>

            <a-form-item label="Number of Database Queries">
              <div style="display: flex; align-items: center; gap: 12px">
                <a-slider
                  v-model:value="queries"
                  :min="2"
                  :max="12"
                  :step="1"
                  style="flex-grow: 1"
                />
                <a-input-number
                  v-model:value="queries"
                  :min="2"
                  :max="12"
                  style="width: 80px"
                />
              </div>
              <span style="font-size: 11px; color: #64748b">
                How many slow queries to execute in this run.
              </span>
            </a-form-item>

            <div style="margin-top: 32px">
              <a-button
                type="primary"
                size="large"
                @click="runBenchmark"
                :loading="running"
                block
                style="
                  height: 48px;
                  border-radius: 8px;
                  font-weight: 600;
                  background: linear-gradient(135deg, #6366f1, #4f46e5);
                "
              >
                <template v-if="!running">Execute SQL Benchmark</template>
                <template v-else>Querying PostgreSQL Database...</template>
              </a-button>
            </div>
          </a-form>
        </a-card>
      </a-col>

      <!-- Results Panel -->
      <a-col :span="14">
        <a-card
          title="Real-Time Benchmark Results"
          class="premium-card"
          :bordered="false"
          style="height: 100%"
        >
          <div
            v-if="!result && !running"
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 48px 0;
              color: #64748b;
            "
          >
            <div style="font-size: 48px; margin-bottom: 16px">📊</div>
            <div style="font-size: 16px; font-weight: 500">
              No Active Benchmark Data
            </div>
            <div style="font-size: 12px; margin-top: 4px">
              Set the parameters on the left and click execute.
            </div>
          </div>

          <div
            v-else-if="running"
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 48px 0;
            "
          >
            <a-spin size="large" />
            <div style="margin-top: 16px; color: #a5b4fc; font-weight: 500">
              Running queries on Supabase...
            </div>
            <div style="margin-top: 4px; font-size: 12px; color: #64748b">
              Comparing Serial (Awaited) vs Parallel (Promise.all)
            </div>
          </div>

          <div
            v-else-if="result"
            style="display: flex; flex-direction: column; gap: 24px"
          >
            <!-- Metrics comparison -->
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <div style="display: flex; gap: 24px">
                <div>
                  <div
                    style="
                      color: #94a3b8;
                      font-size: 12px;
                      text-transform: uppercase;
                    "
                  >
                    Serial Duration
                  </div>
                  <div
                    style="font-size: 24px; font-weight: 700; color: #f43f5e"
                  >
                    {{ result.summary.serialDurationMs }}
                    <span style="font-size: 14px">ms</span>
                  </div>
                </div>
                <div
                  style="border-right: 1px solid #1f2937; height: 40px"
                ></div>
                <div>
                  <div
                    style="
                      color: #94a3b8;
                      font-size: 12px;
                      text-transform: uppercase;
                    "
                  >
                    Parallel Duration
                  </div>
                  <div
                    style="font-size: 24px; font-weight: 700; color: #6366f1"
                  >
                    {{ result.summary.parallelDurationMs }}
                    <span style="font-size: 14px">ms</span>
                  </div>
                </div>
              </div>

              <!-- Speedup Banner -->
              <div
                class="speedup-badge"
                style="
                  padding: 12px 24px;
                  border-radius: 8px;
                  text-align: center;
                "
              >
                <div
                  style="
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    opacity: 0.8;
                  "
                >
                  Performance Gain
                </div>
                <div
                  style="
                    font-size: 22px;
                    font-weight: 800;
                    font-family: var(--font-heading);
                  "
                >
                  {{ result.summary.speedupFactor }}x Faster
                </div>
              </div>
            </div>

            <!-- Double Bar Chart Comparison -->
            <div>
              <div
                style="
                  margin-bottom: 8px;
                  font-size: 13px;
                  font-weight: 500;
                  color: #94a3b8;
                "
              >
                Total Execution Response Time:
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px">
                <!-- Serial Total Bar -->
                <div>
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      font-size: 12px;
                      margin-bottom: 4px;
                    "
                  >
                    <span style="color: #f43f5e; font-weight: 600"
                      >Serial Execution (Sequential Queries)</span
                    >
                    <span>{{ result.summary.serialDurationMs }} ms (100%)</span>
                  </div>
                  <div
                    style="
                      background: #1e293b;
                      height: 16px;
                      border-radius: 8px;
                      overflow: hidden;
                      width: 100%;
                    "
                  >
                    <div
                      class="serial-bar"
                      :style="{ width: '100%' }"
                      style="height: 100%; border-radius: 8px"
                    ></div>
                  </div>
                </div>

                <!-- Parallel Total Bar -->
                <div>
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      font-size: 12px;
                      margin-bottom: 4px;
                    "
                  >
                    <span style="color: #6366f1; font-weight: 600"
                      >Parallel Execution (Concurrent Queries)</span
                    >
                    <span
                      >{{ result.summary.parallelDurationMs }} ms ({{
                        (
                          (result.summary.parallelDurationMs /
                            result.summary.serialDurationMs) *
                          100
                        ).toFixed(0)
                      }}%)</span
                    >
                  </div>
                  <div
                    style="
                      background: #1e293b;
                      height: 16px;
                      border-radius: 8px;
                      overflow: hidden;
                      width: 100%;
                    "
                  >
                    <div
                      class="parallel-bar"
                      :style="{
                        width:
                          (result.summary.parallelDurationMs /
                            result.summary.serialDurationMs) *
                            100 +
                          '%',
                      }"
                      style="height: 100%; border-radius: 8px"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Timeline Gantt Charts & Logs -->
    <a-row v-if="result" :gutter="24" style="margin-bottom: 24px">
      <a-col :span="14">
        <a-card
          title="Execution Timelines (Overlap Visualizer)"
          class="premium-card"
          :bordered="false"
        >
          <template #extra>
            <span style="color: #94a3b8; font-size: 11px"
              >Timeline normalized to serial duration</span
            >
          </template>

          <div style="display: flex; flex-direction: column; gap: 20px">
            <!-- Serial Timeline -->
            <div>
              <h4
                style="
                  margin: 0 0 10px 0;
                  color: #f43f5e;
                  font-size: 14px;
                  font-weight: 600;
                "
              >
                Serial Queries (Awaited sequentially)
              </h4>
              <div class="timeline-container">
                <div
                  v-for="item in result.serialTimeline"
                  :key="'s-' + item.queryId"
                  class="timeline-row"
                >
                  <div class="timeline-label">Query {{ item.queryId }}</div>
                  <div class="timeline-track">
                    <div
                      class="timeline-bar serial-bar"
                      :style="{
                        left: (item.startedAt / maxDuration) * 100 + '%',
                        width: (item.durationMs / maxDuration) * 100 + '%',
                      }"
                    >
                      {{ item.durationMs }}ms
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Parallel Timeline -->
            <div>
              <h4
                style="
                  margin: 0 0 10px 0;
                  color: #6366f1;
                  font-size: 14px;
                  font-weight: 600;
                "
              >
                Parallel Queries (Executed concurrently)
              </h4>
              <div class="timeline-container">
                <div
                  v-for="item in result.parallelTimeline"
                  :key="'p-' + item.queryId"
                  class="timeline-row"
                >
                  <div class="timeline-label">Query {{ item.queryId }}</div>
                  <div class="timeline-track">
                    <div
                      class="timeline-bar parallel-bar"
                      :style="{
                        left: (item.startedAt / maxDuration) * 100 + '%',
                        width: (item.durationMs / maxDuration) * 100 + '%',
                      }"
                    >
                      {{ item.durationMs }}ms
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="10">
        <a-card
          title="Execution Logs Console"
          class="premium-card"
          :bordered="false"
          style="height: 100%"
        >
          <div
            class="console-log"
            style="
              height: calc(100% - 10px);
              min-height: 420px;
              overflow-y: auto;
            "
          >
            <div
              v-for="(log, idx) in consoleLogs"
              :key="idx"
              style="margin-bottom: 4px; line-height: 1.4"
            >
              <span
                :style="{
                  color:
                    log.type === 'info'
                      ? '#a5b4fc'
                      : log.type === 'serial'
                        ? '#f43f5e'
                        : '#10b981',
                }"
              >
                {{ log.text }}
              </span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Run History Table -->
    <a-card class="premium-card" :bordered="false" style="margin-bottom: 24px">
      <template #title>
        <span
          style="
            font-family: var(--font-heading);
            font-weight: 600;
            font-size: 18px;
          "
          >Benchmark Run History</span
        >
      </template>
      <template #extra>
        <a-button
          type="link"
          danger
          v-if="history.length"
          @click="clearHistory"
          style="padding: 0"
        >
          Clear History
        </a-button>
      </template>

      <a-table
        :columns="historyColumns"
        :data-source="history"
        :pagination="{ pageSize: 5 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'delay'">
            <span>{{ record.simulatedDelay }} ms</span>
          </template>
          <template v-else-if="column.key === 'serial'">
            <span style="color: #f43f5e; font-weight: 500"
              >{{ record.serialTimeMs }} ms</span
            >
          </template>
          <template v-else-if="column.key === 'parallel'">
            <span style="color: #6366f1; font-weight: 500"
              >{{ record.parallelTimeMs }} ms</span
            >
          </template>
          <template v-else-if="column.key === 'speedup'">
            <a-tag color="success" style="font-weight: 600">
              {{ (record.serialTimeMs / record.parallelTimeMs).toFixed(2) }}x
            </a-tag>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            <span>{{ formatDateTime(record.createdAt) }}</span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { message } from "ant-design-vue";
import api from "../api";

interface Stats {
  users: number;
  posts: number;
  comments: number;
  categories: number;
  tags: number;
}

interface HistoryRun {
  id: number;
  simulatedDelay: number;
  queryCount: number;
  serialTimeMs: number;
  parallelTimeMs: number;
  createdAt: string;
}

interface TimelineItem {
  queryId: number;
  startedAt: number;
  durationMs: number;
  endedAt: number;
}

interface BenchmarkResult {
  summary: {
    delay: number;
    queriesCount: number;
    serialDurationMs: number;
    parallelDurationMs: number;
    speedupFactor: number;
    savedRunId: number;
  };
  serialTimeline: TimelineItem[];
  parallelTimeline: TimelineItem[];
}

interface LogEntry {
  type: "info" | "serial" | "parallel";
  text: string;
}

const delay = ref(100);
const queries = ref(5);
const running = ref(false);
const result = ref<BenchmarkResult | null>(null);
const stats = ref<Stats>({
  users: 0,
  posts: 0,
  comments: 0,
  categories: 0,
  tags: 0,
});
const history = ref<HistoryRun[]>([]);
const consoleLogs = ref<LogEntry[]>([]);

const statCards = computed(() => [
  { label: "Registered Users", value: stats.value.users },
  { label: "Total Posts", value: stats.value.posts },
  { label: "Comments Count", value: stats.value.comments },
  { label: "Categories", value: stats.value.categories },
  { label: "Tags Linked", value: stats.value.tags },
]);

const maxDuration = computed(() => {
  if (!result.value) return 1000;
  const sMax = Math.max(...result.value.serialTimeline.map((t) => t.endedAt));
  const pMax = Math.max(...result.value.parallelTimeline.map((t) => t.endedAt));
  return Math.max(sMax, pMax, 1);
});

const historyColumns = [
  { title: "Run ID", dataIndex: "id", key: "id", width: 80 },
  { title: "Date & Time", key: "createdAt", width: 200 },
  { title: "Delay (Per Query)", key: "delay", width: 150 },
  {
    title: "Queries Run",
    dataIndex: "queryCount",
    key: "queryCount",
    width: 120,
  },
  { title: "Serial Time", key: "serial", width: 140 },
  { title: "Parallel Time", key: "parallel", width: 140 },
  { title: "Speedup", key: "speedup", width: 120 },
];

const fetchStats = async () => {
  try {
    const res = await api.get("/benchmark/stats");
    stats.value = res.data;
  } catch (error) {
    console.error("Failed to load database stats:", error);
  }
};

const fetchHistory = async () => {
  try {
    const res = await api.get("/benchmark/history");
    history.value = res.data;
  } catch (error) {
    console.error("Failed to load benchmark history:", error);
  }
};

const clearHistory = async () => {
  try {
    await api.delete("/benchmark/history");
    message.success("Benchmark history cleared.");
    fetchHistory();
  } catch (error) {
    message.error("Failed to clear history.");
  }
};

const runBenchmark = async () => {
  running.value = true;
  result.value = null;
  consoleLogs.value = [];

  addLog(
    "info",
    `Initializing SQL Benchmark (Delay: ${delay.value}ms, Queries: ${queries.value})...`,
  );
  addLog("info", `Connecting to PostgreSQL database via Prisma client...`);

  try {
    const response = await api.post("/benchmark/run", {
      delay: delay.value,
      queries: queries.value,
    });

    result.value = response.data;
    generateLogs(response.data);
    message.success("Benchmark completed!");

    // Refresh history and database counts (just in case)
    fetchHistory();
    fetchStats();
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || error.message;
    message.error("Benchmark failed: " + errorMsg);
    addLog("info", `❌ Error during benchmark: ${errorMsg}`);
  } finally {
    running.value = false;
  }
};

const addLog = (type: "info" | "serial" | "parallel", text: string) => {
  consoleLogs.value.push({ type, text });
};

const generateLogs = (res: BenchmarkResult) => {
  addLog("info", `\n--- 🚀 SERIAL EXECUTION (Sequential queries) ---`);
  res.serialTimeline.forEach((t) => {
    addLog("serial", `T+${t.startedAt}ms: [Serial] Query ${t.queryId} started`);
    addLog(
      "serial",
      `T+${t.endedAt}ms: [Serial] Query ${t.queryId} finished in ${t.durationMs}ms`,
    );
  });
  addLog("serial", `Total Serial Time: ${res.summary.serialDurationMs}ms`);

  addLog("info", `\n--- 🚀 PARALLEL EXECUTION (Promise.all concurrent) ---`);
  res.parallelTimeline.forEach((t) => {
    addLog(
      "parallel",
      `T+${t.startedAt}ms: [Parallel] Query ${t.queryId} started concurrently`,
    );
  });
  res.parallelTimeline.forEach((t) => {
    addLog(
      "parallel",
      `T+${t.endedAt}ms: [Parallel] Query ${t.queryId} finished in ${t.durationMs}ms`,
    );
  });
  addLog(
    "parallel",
    `Total Parallel Time: ${res.summary.parallelDurationMs}ms`,
  );

  addLog("info", `\n--- 🎉 SUMMARY ---`);
  addLog(
    "info",
    `Parallel execution completed ${res.summary.speedupFactor}x faster than Serial!`,
  );
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

onMounted(() => {
  fetchStats();
  fetchHistory();
});
</script>
