<script setup>
import { ref, onMounted, computed } from "vue";
import { backendApi } from "../services/api";

const downtimeList = ref([]);
const deteksiTahun = ref(new Date().getFullYear().toString()); //ini utk performa berubah tiap tahun

const loadDowntime = async () => {
  try {
    const response = await backendApi.get("/mtc/downtime", { timeout: 30000 });
    downtimeList.value = response.data.results || [];
  } catch (err) {
    console.error(err);
  }
};

//reduce jmlah status Tahun ini...berubah tiap tahun
const tahunIni = computed(() => {
  const query = deteksiTahun.value.toLowerCase();

  let result = [...downtimeList.value];

  if (query) {
    result = result.filter((note) =>
      `${note.tgl_downtime || ""} `.toLowerCase().includes(query),
    );
  }

  return result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
});

onMounted(loadDowntime);
</script>

<template>
  <div class="top-downtime-card">
    <div class="card-header">
      <h3>Top Downtime</h3>
      <span>{{ tahunIni.length }} Mesin</span>
    </div>

    <div
      v-for="(item, index) in tahunIni.slice(0, 10)"
      :key="item.mesin"
      class="downtime-item"
    >
      <div class="rank">
        <span
          :class="[
            'rank-badge',
            index === 0
              ? 'gold'
              : index === 1
                ? 'silver'
                : index === 2
                  ? 'bronze'
                  : '',
          ]"
        >
          {{ index + 1 }}
        </span>
      </div>

      <div class="mesin-info">
        <div class="mesin-name">
          {{ item.mesin }}
        </div>

        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{
              width:
                (item.jumlah_downtime / tahunIni[0]?.jumlah_downtime) * 100 +
                '%',
            }"
          />
        </div>
      </div>

      <div class="jumlah">{{ item.jumlah_downtime }}x</div>
    </div>
    <div v-if="tahunIni.length === 0" class="empty-state">
      <span class="state-icon" aria-hidden="true">X</span>
      <p>Tidak ada data untuk dianalisa</p>
    </div>
  </div>
</template>

<style lang="css" scoped>
.top-downtime-card {
  background: #fff;
  border-radius: 15px;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  height: 400px;
  width: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  position: sticky;
  top: 130px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.card-header span {
  font-size: 12px;
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 999px;
}

.downtime-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.rank-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  color: #333;
}

.gold {
  background: #ffd700;
  color: #333;
}

.silver {
  background: #c0c0c0;
  color: #333;
}

.bronze {
  background: #cd7f32;
  color: white;
}

.mesin-info {
  flex: 1;
}

.mesin-name {
  font-weight: 600;
  margin-bottom: 5px;
  color: #334155;
}

.progress-bar {
  height: 8px;
  border-radius: 20px;
  background: #e2e8f0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 20px;
  background: linear-gradient(90deg, #ef4444, #f97316);
  transition: 0.3s;
}

.jumlah {
  min-width: 45px;
  text-align: right;
  font-weight: 700;
  color: #ef4444;
}

.empty-state {
  display: flex;
  min-height: 270px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.state-icon {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border-radius: 18px;
  background: #edf4ff;
  color: red;
  font-size: 27px;
}

.empty-state h3 {
  margin: 17px 0 5px;
  color: #333;
  font-size: 17px;
}

.empty-state p {
  margin-bottom: 17px;
  color: #333;
  font-size: 13px;
}
</style>
