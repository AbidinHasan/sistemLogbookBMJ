<script setup>
import { ref, onMounted, computed } from "vue";
import { backendApi } from "../services/api.js";
import { useAuthStore } from "../stores/auth.js";

const auth = useAuthStore();
const notes = ref([]);
const searchQuery = ref(new Date().getFullYear().toString()); //ini utk filter Tahunnya yoo
const statusFilter = ref("");
const errorMessage = ref("");
const grup = ref("");
const chartFilter = ref("week"); // week | month | year

const statusSummary = computed(() => {
  const total = filteredNotes.value.length;

  const completed = filteredNotes.value.filter(
    (item) => item.status === "Completed",
  ).length;

  const onProgress = filteredNotes.value.filter(
    (item) => item.status === "On Progress",
  ).length;

  const pending = filteredNotes.value.filter(
    (item) => item.status === "Pending",
  ).length;

  return {
    total,
    completed,
    onProgress,
    pending,
    completedPercent: total ? (completed / total) * 100 : 0,
    onProgressPercent: total ? (onProgress / total) * 100 : 0,
    pendingPercent: total ? (pending / total) * 100 : 0,
  };
});

const statusMesin = computed(() => {
  const total = filteredNotes.value.length;

  const NDT = filteredNotes.value.filter(
    (item) => item.status_mesin === "No Downtime",
  ).length;

  const MNTR = filteredNotes.value.filter(
    (item) => item.status_mesin === "Monitoring",
  ).length;

  const DT = filteredNotes.value.filter(
    (item) => item.status_mesin === "Downtime",
  ).length;

  return {
    total,
    NDT,
    MNTR,
    DT,
    NDTpersen: total ? (NDT / total) * 100 : 0,
    MonPersen: total ? (MNTR / total) * 100 : 0,
    DTpersen: total ? (DT / total) * 100 : 0,
  };
});

const chartData = computed(() => {
  const now = new Date();

  if (chartFilter.value === "week") {
    const data = Array(7).fill(0);

    filteredNotes.value.forEach((item) => {
      if (!item.tanggal) return;

      const date = new Date(item.tanggal);

      const diffDay = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffDay >= 0 && diffDay < 7) {
        data[6 - diffDay]++;
      }
    });

    return data;
  }

  if (chartFilter.value === "month") {
    const data = Array(30).fill(0);

    filteredNotes.value.forEach((item) => {
      if (!item.tanggal) return;

      const date = new Date(item.tanggal);

      const diffDay = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffDay >= 0 && diffDay < 30) {
        data[29 - diffDay]++;
      }
    });

    return data;
  }

  // YEAR
  const data = Array(12).fill(0);

  filteredNotes.value.forEach((item) => {
    if (!item.tanggal) return;

    const date = new Date(item.tanggal);

    if (date.getFullYear() === now.getFullYear()) {
      data[date.getMonth()]++;
    }
  });

  return data;
});

const labels = computed(() => {
  if (chartFilter.value === "week") {
    return ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  }

  if (chartFilter.value === "month") {
    return Array.from({ length: 30 }, (_, i) => i + 1);
  }

  return [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
});

const monthlyCounts = computed(() => {
  const data = Array(12).fill(0);

  filteredNotes.value.forEach((item) => {
    if (!item.tanggal) return;

    const date = new Date(item.tanggal);

    if (searchQuery.value && date.getFullYear() !== Number(searchQuery.value)) {
      return;
    }

    data[date.getMonth()]++;
  });

  return data;
});

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const chartPoints1212 = computed(() => {
  const data = chartData.value;
  const max = Math.max(...data, 1);

  const spacing = 330 / (data.length - 1);

  return data.map((value, index) => ({
    x: 15 + index * spacing,
    y: 100 - (value / max) * 80,
    value,
    label: labels.value[index],
  }));
});

const chartPoints = computed(() => {
  const data = chartData.value;
  const max = Math.max(...data, 1);

  const chartWidth = chartFilter.value === "month" ? 650 : 330;

  const spacing = chartWidth / (data.length - 1);

  return data.map((value, index) => {
    const x = 15 + index * spacing;

    return {
      x,
      y: 100 - (value / max) * 80,
      value,
      label: labels.value[index],

      // posisi tooltip
      tooltipX: index === 0 ? x : index === data.length - 1 ? x - 70 : x - 35,
    };
  });
});

const polylinePoints = computed(() =>
  chartPoints.value.map((p) => `${p.x},${p.y}`).join(" "),
);
const areaPath = computed(() => {
  const points = chartPoints.value;

  if (!points.length) return "";

  const start = `M${points[0].x},${points[0].y}`;

  const lines = points
    .slice(1)
    .map((p) => `L${p.x},${p.y}`)
    .join(" ");

  const end = `L${points[points.length - 1].x},120 L${points[0].x},120 Z`;

  return `${start} ${lines} ${end}`;
});

//Urutkan array berdasarkan tanggal dari terbaru ke terlama & status
const filteredNotes = computed(() => {
  const query = searchQuery.value.toLowerCase();

  let result = [...notes.value];

  if (grup.value) {
    result = result.filter((note) => note.grup === grup.value);
  }

  if (query) {
    result = result.filter((note) =>
      `${note.caption || ""} ${note.tanggal || ""}`
        .toLowerCase()
        .includes(query),
    );
  }

  if (statusFilter.value) {
    result = result.filter((note) => note.status === statusFilter.value);
  }

  return result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
});

//Persentase
const completedPersen = computed(() => {
  const total = filteredNotes.value.length;

  if (!total) return 0;

  const completed = filteredNotes.value.filter(
    (item) => item.status === "Completed",
  ).length;

  return ((completed / total) * 100).toFixed(2);
});

//progressPersentase
const onProgressPersen = computed(() => {
  const total = filteredNotes.value.length;

  if (!total) return 0;

  const progress = filteredNotes.value.filter(
    (item) => item.status === "On Progress",
  ).length;

  return ((progress / total) * 100).toFixed(2);
});

//pendingPersentase
const pendingPersen = computed(() => {
  const total = filteredNotes.value.length;

  if (!total) return 0;

  const pending = filteredNotes.value.filter(
    (item) => item.status === "Pending",
  ).length;

  return ((pending / total) * 100).toFixed(2);
});

//StatusMesin
const MesinPersen = computed(() => {
  const total = filteredNotes.value.length;

  if (!total) return 0;

  const NDT = filteredNotes.value.filter(
    (item) => item.status_mesin === "No Downtime",
  ).length;
  const DT = filteredNotes.value.filter(
    (item) => item.status_mesin === "Downtime",
  ).length;
  const MNTR = filteredNotes.value.filter(
    (item) => item.status_mesin === "Monitoring",
  ).length;

  return {
    NDT: ((NDT / total) * 100).toFixed(2),
    DT: ((DT / total) * 100).toFixed(2),
    MNTR: ((MNTR / total) * 100).toFixed(2),
  };
});

const loadNotes = async () => {
  errorMessage.value = "";

  try {
    const response = await backendApi.get("/mtc", {
      params: { user_id: auth.id },
      timeout: 30000,
    });
    notes.value = response.data.results || [];
  } catch (error) {
    console.error("Gagal memuat catatan:", error);
    errorMessage.value = "Catatan gagal dimuat. Silakan coba lagi.";
    if (error.code === "ECONNABORTED") {
      errorMessage.value = "Request timeout. Server terlalu lama merespons.";
    } else {
      errorMessage.value = "Catatan gagal dimuat. Silakan coba lagi.";
    }
  } finally {
  }
};

onMounted(() => {
  loadNotes();
  grup.value = localStorage.getItem("grup");
});
</script>
<template>
  <div class="stat-card-perform">
    <div class="stat-card-perform-header">
      <div class="stat-card-perform-title">
        {{
          chartFilter === "week"
            ? "Last 7 Days"
            : chartFilter === "month"
              ? "30 Days"
              : "1 Year"
        }}
      </div>
      <div class="menu-wrapper">
        <select class="Tahun" v-model="chartFilter">
          <option value="week">1 Minggu</option>
          <option value="month">1 Bulan</option>
          <option value="year">1 Tahun</option>
        </select>
      </div>
    </div>
    <div class="stat-card-perform-chart">
      <div class="chart-wrapper">
        <svg
          class="linechart"
          :viewBox="`0 -30 ${chartFilter === 'month' ? 700 : 360} 150`"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3d8bff" />
              <stop offset="100%" stop-color="#1ecb6b" />
            </linearGradient>

            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3d8bff" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#1ecb6b" stop-opacity="0" />
            </linearGradient>
          </defs>

          <!-- Area -->
          <path :d="areaPath" fill="url(#areaGradient)" />

          <!-- Line -->
          <polyline
            :points="polylinePoints"
            fill="none"
            stroke="url(#lineGradient)"
            stroke-width="4"
          />

          <!-- Dots -->
          <g v-for="point in chartPoints" :key="point.label" class="dot-group">
            <circle
              :cx="point.x"
              :cy="point.y"
              r="6"
              fill="#3d8bff"
              class="chart-dot"
            />

            <g class="tooltip">
              <rect
                :x="point.tooltipX"
                :y="point.y - 36"
                width="70"
                height="30"
                rx="8"
              />

              <text
                :x="point.tooltipX + 35"
                :y="point.y - 16"
                text-anchor="middle"
              >
                {{ point.label }}: {{ point.value }}
              </text>
            </g>
          </g>

          <!-- Label bawah -->
          <g class="x-labels">
            <text
              v-for="point in chartPoints"
              :key="point.label + '-label'"
              :x="point.x"
              y="115"
              text-anchor="middle"
            >
              {{ point.label }}
            </text>
          </g>
        </svg>
      </div>
    </div>

    <div class="legend-total">{{ statusSummary.total }} Aktifitas</div>
  </div>
</template>
<style scoped>
.stat-card-perform {
  background: #232733;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.18);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  width: 440px;
  color: #f3f6fa;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-card-perform-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card-perform-header h2 {
  font-family: "Inter", sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: #f3f6fa;
  letter-spacing: 0.01em;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(90deg, #fff 0%, #f3f6fa 50%, #e3e8ef 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-card-perform-title {
  font-family: "Inter", sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: #f3f6fa;
  letter-spacing: 0.01em;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(90deg, #fff 0%, #f3f6fa 50%, #e3e8ef 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-card-perform-menu {
  font-size: 1.3rem;
  color: #6c7383;
  cursor: pointer;
}

.stat-card-perform-chart {
  display: flex;
  justify-content: center;
  align-items: center;
}

.donut {
  width: 170px;
  height: 170px;
}

.donut-bg {
  fill: none;
  stroke: #232733;
  stroke-width: 14;
}

.donut-segment.sales {
  stroke: #3d8bff;
}

.donut-segment.product {
  stroke: #ff6a3d;
}

.donut-segment.income {
  stroke: #1ecb6b;
}

.donut-segment {
  fill: none;
  stroke-width: 14;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s;
}

.donut-segment2 {
  fill: none;
  stroke: #1ecb6b;
  stroke-width: 14;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s;
}

.donut-segment3 {
  fill: none;
  stroke: #3d8bff;
  stroke-width: 14;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s;
}

.donut-text-main {
  font-size: 2.1rem;
  font-weight: 600;
  fill: #f3f6fa;
}

.donut-text-sub {
  font-size: 1rem;
  fill: #b0b6c3;
}

.stat-card-perform-legend {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  color: #b0b6c3;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.5rem;
}

.legend-dot.sales {
  background: #3dff4a;
}

.legend-dot.product {
  background: #ff6a3d;
}

.legend-dot.income {
  background: #1ecb6b;
}

.legend-value {
  font-size: 2rem;
  color: #3d8bff;
  font-weight: 600;
  margin-left: 0.5rem;
}

.legend-change {
  color: #1ecb6b;
  font-weight: 600;
  margin-left: 10px;
}

.chart-wrapper {
  overflow-x: auto;
}

.linechart {
  width: 100%;
  max-width: 560px;
  height: 120px;
  display: block;
}

.linechart .x-labels text {
  font-family: "Inter", sans-serif;
  font-size: 12px;
  fill: #b0b6c3;
}

.dot-group .tooltip {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.dot-group:hover .tooltip {
  opacity: 1;
}

.tooltip {
  opacity: 0;
  visibility: hidden;
  transition: 0.2s;
}

.chart-dot:hover + .tooltip {
  opacity: 1;
  visibility: visible;
}

.dot-group .tooltip rect {
  fill: #232733;
  stroke: #232733;
  stroke-width: 1.2;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.22));
  rx: 8;
  opacity: 0.92;
}

.dot-group .tooltip text {
  font-family: "Inter", sans-serif;
  font-size: 15px;
  font-weight: 500;
  fill: #fff;
  letter-spacing: 0.2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.menu-wrapper {
  position: relative;
  display: inline-block;
  margin-right: 4px;
}
.Tahun {
  padding: 5px 13px;
  border-radius: 5px;
  background: #232733;
  font-family: var(--mono);
  color: var(--text-h);
}
@media (max-width: 700px) {
  .Tahun {
    padding: 4px 11px;
    font-size: 12px;
  }
}

.menu-dots {
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;
  width: 18px;
  align-items: center;
  margin: 0 8px;
}

.menu-dots span {
  display: block;
  width: 5px;
  height: 5px;
  background: #6c7383;
  border-radius: 50%;
  transition: background 0.2s;
}

.menu-toggle {
  display: none;
}

.menu-select {
  display: none;
  position: absolute;
  right: 0;
  top: 30px;
  min-width: 110px;
  z-index: 10;
  padding: 8px 0;
  border-radius: 18px;
  border: 1.5px solid rgba(80, 90, 120, 0.18);
  background: rgba(30, 34, 44, 0.72);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition:
    opacity 0.25s cubic-bezier(0.4, 2, 0.6, 1),
    transform 0.25s cubic-bezier(0.4, 2, 0.6, 1);
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
  pointer-events: none;
}

.menu-toggle:checked + .menu-dots + .menu-select {
  display: block;
  opacity: 1;
  transform: scale(1) translateY(0);
  pointer-events: auto;
}

.menu-select div {
  padding: 10px 20px 10px 16px;
  color: #f3f6fa;
  cursor: pointer;
  font-size: 15px;
  font-family: "Inter", sans-serif;
  border-left: 3px solid transparent;
  margin-bottom: 2px;
  border-radius: 8px;
  transition:
    background 0.18s,
    color 0.18s,
    border-left 0.18s;
}

.menu-select div:nth-child(1) {
  border-left: 3px solid #3d8bff;
}
.menu-select div:nth-child(2) {
  border-left: 3px solid #ff6a3d;
}
.menu-select div:nth-child(3) {
  border-left: 3px solid #1ecb6b;
}

.menu-select div:hover {
  background: rgba(61, 139, 255, 0.08);
  color: #3d8bff;
  border-left: 3px solid #3d8bff;
}
.menu-select div:nth-child(2):hover {
  background: rgba(255, 106, 61, 0.08);
  color: #ff6a3d;
  border-left: 3px solid #ff6a3d;
}
.menu-select div:nth-child(3):hover {
  background: rgba(30, 203, 107, 0.08);
  color: #1ecb6b;
  border-left: 3px solid #1ecb6b;
}

.stat-card-perform-legend .legend-item:first-child {
  font-size: 0.95rem;
  color: #b8c0cc;
  font-weight: 400;
  letter-spacing: 0.01em;
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.legend-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cfd5df;
  font-size: 13px;
}

.legend-info small {
  margin-left: auto;
  font-size: 11px;
  color: #8e99ab;
}

.progress {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.completed {
  background: #22c55e;
}

.progress-color {
  background: #f0f63b;
}

.pending {
  background: #f50b0b;
}

.progress-fill.completed {
  background: linear-gradient(90deg, #16a34a, #22c55e);
}

.progress-fill.progress-color {
  background: linear-gradient(90deg, #d4eb25, #edfa60);
}

.progress-fill.pending {
  background: linear-gradient(90deg, #eb2525, #fa6060);
}
</style>
