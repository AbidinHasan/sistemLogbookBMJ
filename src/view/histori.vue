<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { backendApi } from "../services/api";
import { useAuthStore } from "../stores/auth";
import * as XLSX from "xlsx";
import ScrollToTopButton from "../components/ScrollUpButton.vue";

const auth = useAuthStore();
const notes = ref([]);
const loading = ref(false);
const search = ref("");
const tmblUp = ref(false);
const visibleCount = ref(10);

const loadData = async () => {
  loading.value = true;

  try {
    const response = await backendApi.get("/histori", {
      timeout: 30000,
    });

    notes.value = response.data.results || [];
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const filteredNotes = computed(() => {
  const query = search.value.toLowerCase();

  let result = [...notes.value];

  if (auth.grup) {
    result = result.filter((item) => item.user.grup === auth.grup);
  }

  if (query) {
    result = result.filter((note) =>
      `
        ${item.nama_barang || ""}
        ${item.user.fullname || ""}
       
      `
        .toLowerCase()
        .includes(query),
    );
  }

  return result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
});

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const exportToExcel = () => {
  const data = filteredNotes.value.map((item) => ({
    Tanggal: formatDate(item.jam),
    Barang: item.nama_barang,
    Action: item.tipe_transaksi,
    Qty: item.qty,

    Stok_Tersedia: item.qty_after,
    Satuan: item.satuan,
    User: item.fullname,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Stok");

  XLSX.writeFile(workbook, "Histori Stok.xlsx");
};

const deleteHistori = async (id) => {
  if (!confirm("Yakin ingin menghapus Riwayat ini?")) {
    return;
  }

  try {
    await backendApi.delete(`/histori/${id}`);
    await loadData();
  } catch (error) {
    console.error("Gagal menghapus:", error);
    alert("Gagal Menghapus");
  }
};

//scroll
const handleScroll = () => {
  tmblUp.value = window.scrollY > 200;

  const nearBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 300;

  if (nearBottom && visibleCount.value < filteredNotes.value.length) {
    visibleCount.value += 6;
  }
};
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  loadData();
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <ScrollToTopButton v-if="tmblUp" @click="scrollToTop" />
  <div class="histori-page">
    <div class="header">
      <h1>📋 Histori Stok</h1>

      <div class="actions">
        <input
          v-model="search"
          type="search"
          placeholder="Cari Riwayat..."
          class="search"
        />
      </div>
      <button class="green-btn" @click="exportToExcel">Export To Excel</button>
    </div>

    <div v-if="loading" class="loading">Memuat data...</div>

    <div v-else-if="filteredNotes.length === 0" class="empty">
      Belum ada histori.
    </div>

    <div v-else class="timeline">
      <div v-for="item in filteredNotes" :key="item.id" class="timeline-item">
        <div class="timeline-dot"></div>

        <div class="card">
          <div class="card-header">
            <h3>{{ item.nama_barang }}</h3>
            <button
              class="delete-btn"
              @click="deleteHistori(item.id)"
              v-if="['admin', 'super-admin'].includes(auth.role)"
            >
              Hapus
            </button>
          </div>

          <div class="description" v-if="item.tipe_transaksi === 'edit'">
            {{ item.tipe_transaksi === "edit" ? "Update Data Stok" : "-" }}
          </div>
          <div class="description" v-else>
            {{
              item.tipe_transaksi === "out"
                ? "⤴️Barang Keluar"
                : item.tipe_transaksi === "in"
                  ? "⬇️Barang Masuk"
                  : item.tipe_transaksi === "new"
                    ? "📩Input Stok Baru"
                    : item.tipe_transaksi === "edit"
                      ? "Telah Diperbaharui"
                      : "-"
            }}
            <strong> {{ item.qty }}</strong> {{ item.satuan }}
          </div>

          <div class="info">
            <span>{{ formatDate(item.jam) }} WIB</span>
            <span>Sisa Stok: {{ item.qty_after }} {{ item.satuan }}</span>
            <span>by {{ item.user.fullname }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.histori-page {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}

.header {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  flex-wrap: wrap;
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header h1 {
  margin: 0;
  color: #fff;
  font-size: 24px;
}

.search {
  width: 280px;
  padding: 10px 15px;
  border-radius: 12px;
  border: none;
  outline: none;
  background: #e1e1e1c5;
  color: rgb(27, 25, 25);
  transition: 0.3s;
}
.search:focus {
  border-color: #2d7dff;
  box-shadow: 0 0 0 3px rgba(45, 125, 255, 0.2);
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 9px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #2d7dff;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-dot {
  position: absolute;
  left: -27px;
  top: 20px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2d7dff;
  border: 3px solid white;
}

.card {
  background: #1c1c1c;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #2c2c2c;
  transition: 0.3s;
  height: auto;
}

.card:hover {
  transform: translateY(-2px);
  border-color: #2d7dff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.card-header h3 {
  margin: 0;
  color: white;
  font-size: 16px;
}

.card-header span {
  color: #999;
  font-size: 13px;
}

.description {
  margin-top: 10px;
  color: #e5e5e5;
  line-height: 1.6;
}

.info {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.info span {
  background: #262626;
  color: #bbb;
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.loading,
.empty {
  text-align: center;
  color: #999;
  padding: 40px;
}

.delete-btn {
  background: #dc2626;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  border: 1px solid #e8edf4;
  border-radius: 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition:
    background 150ms ease,
    border-color 150ms ease;
}

.delete-btn:hover {
  background: #b91c1c;
}

.green-btn {
  background: #11c900;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  border: 1px solid #e8edf4;
  border-radius: 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition:
    background 150ms ease,
    border-color 150ms ease;
}

.green-btn:hover {
  background: #10930d;
}

@media (max-width: 700px) {
  .actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .search {
    width: 100%;
  }

  .info span {
    font-size: 11px;
    padding: 4px 8px;
  }

  .description {
    font-size: 14px;
  }
}
</style>
