<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { backendApi, API } from "../services/api.js";
import { useAuthStore } from "../stores/auth.js";
import { useRouter } from "vue-router";
import * as XLSX from "xlsx";
import DownloadKecil from "../components/DownloadKecilBtn.vue";
import pdfLogo from "../assets/icons8-pdf-60.png";
import ecxlLogo from "../assets/icons8-excel-48.png";
import wordLogo from "../assets/icons8-microsoft-word-48.png";
import mp3Logo from "../assets/icons8-music-48.png";
import pptLogo from "../assets/icons8-powerpoint-48.png";
import txtLogo from "../assets/icons8-txt-64.png";
import zipLogo from "../assets/icons8-zip-64.png";
import coretan from "../assets/icons8-note-taking-with-text-document-and-editing-pen-100.png";
import LoadingContent from "../components/loadingSend.vue";
import ScrollToTopButton from "../components/ScrollUpButton.vue";
import RadioSelect from "../components/radioSelect.vue";
import RadioInOut from "../components/RadioInOut.vue";
import summaryMonth from "../components/ChardPerform.vue";
import SwitchView from "../components/SwitchView.vue";
import BtnExport from "../components/ExportBtn.vue";
import editPopUp from "../components/popUpDropdown.vue";
import reviewHist from "../components/ReviewBtn.vue";

const router = useRouter();
const auth = useAuthStore();
const notes = ref([]);
const searchQuery = ref("");
const isModalOpen = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");
const selectedFile = ref(null);
const fileError = ref("");
const loading = ref(false);
const showCaptionModal = ref(false);
const selectedCaption = ref("");
const tmblUp = ref(false);
const statusFilter = ref("");
const visibleCount = ref(10); //scroll max
const summaryPerform = ref(false);
const listView = ref(false);
const showPreviewModal = ref(false);
const selectedItem = ref(null);
const modalEditStatus = ref(false);
const outbond = ref(0);
const inbond = ref(0);
const StokKeluar = ref(true);

const previewItem = (item) => {
  selectedItem.value = item;
  showPreviewModal.value = true;
};

const closePreviewItem = () => {
  showPreviewModal.value = false;
  selectedItem.value = null;
};

const tutupSummary = () => {
  summaryPerform.value = false;
};

const previewCaption = (caption) => {
  selectedCaption.value = caption;
  showCaptionModal.value = true;
};

const closeCaptionModal = () => {
  showCaptionModal.value = false;
};

const viewHistori = () => {
  router.push("/stok/histori");
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
//membatasi render per scroll
const visibleNotes = computed(() => {
  return filteredNotes.value.slice(0, visibleCount.value);
});

watch([searchQuery, statusFilter], () => {
  visibleCount.value = 6;
});

const form = ref({
  id: null,
  tanggal: "",
  nama_barang: "",
  kategori: "",
  qty: 0,
  stok_min: 0,
  stok_max: 99,
  satuan: "",
  lokasi: "",
  keterangan: "",
  renew: "",
});

const BarangGrup = computed(() => {
  const query = searchQuery.value.toLowerCase();

  let result = [...notes.value];

  if (auth.grup) {
    result = result.filter((note) => note.grup === auth.grup);
  }

  return result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
});
const stokSummary = computed(() => {
  return {
    habis: BarangGrup.value.filter(
      (item) => Number(item.qty) <= Number(item.stok_min),
    ).length,

    penuh: BarangGrup.value.filter(
      (item) => Number(item.qty) >= Number(item.stok_max),
    ).length,

    aman: BarangGrup.value.filter(
      (item) =>
        Number(item.qty) > Number(item.stok_min) &&
        Number(item.qty) < Number(item.stok_max),
    ).length,

    total: BarangGrup.value.length,
  };
});

//Urutkan array berdasarkan tanggal dari terbaru ke terlama & status
const filteredNotes = computed(() => {
  const query = searchQuery.value.toLowerCase();

  let result = [...notes.value];

  if (auth.grup) {
    result = result.filter((note) => note.grup === auth.grup);
  }

  if (query) {
    result = result.filter((note) =>
      `
        ${note.nama_barang || ""}
        ${note.kategori || ""}
        ${note.lokasi || ""}
        ${note.keterangan || ""}
      `
        .toLowerCase()
        .includes(query),
    );
  }

  if (statusFilter.value) {
    result = result.filter((note) => {
      const qty = Number(note.qty);
      const min = Number(note.stok_min);
      const max = Number(note.stok_max);

      if (statusFilter.value === "Restock") {
        return qty <= min;
      }

      if (statusFilter.value === "Penuh") {
        return qty >= max;
      }

      if (statusFilter.value === "Aman") {
        return qty > min && qty < max;
      }

      return true;
    });
  }

  return result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
});

const loadNotes = async () => {
  loading.value = true;
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await backendApi.get("/stok1", { timeout: 30000 });
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
    isLoading.value = false;
    loading.value = false;
  }
};

const openCreateModal = () => {
  resetForm();
  errorMessage.value = "";
  isModalOpen.value = true;
};

const editData = (item) => {
  form.value = {
    id: item.id,
    nama_barang: item.nama_barang || "",
    tanggal: item.tanggal || "",
    kategori: item.kategori || "",
    satuan: item.satuan || "",
    qty: item.qty || "",
    stok_min: item.stok_min || "",
    stok_max: item.stok_max || "",
    keterangan: item.keterangan || "",
    lokasi: item.lokasi || "",
    renew: item.renew || "",
  };
  selectedFile.value = null;
  errorMessage.value = "";
  isModalOpen.value = true;
};
const editDataStatus = (item) => {
  form.value = {
    id: item.id,
    nama_barang: item.nama_barang || "",
    tanggal: item.tanggal || "",
    kategori: item.kategori || "",
    satuan: item.satuan || "",
    qty: item.qty || "",
    stok_min: item.stok_min || "",
    stok_max: item.stok_max || "",
    keterangan: item.keterangan || "",
    lokasi: item.lokasi || "",
    renew: item.renew || "",
  };

  selectedFile.value = null;
  errorMessage.value = "";
  modalEditStatus.value = true;
};
const sisaStok = computed(() => {
  let hasil = Number(form.value.qty || 0);

  if (Number(outbond.value) > 0) {
    hasil -= Number(outbond.value);
  }

  if (Number(inbond.value) > 0) {
    hasil += Number(inbond.value);
  }

  return hasil < 0 ? "Stok tidak cukup" : hasil;
});

const closeModal = () => {
  if (isSaving.value) {
    return;
  }

  isModalOpen.value = false;
  modalEditStatus.value = false;
  resetForm();
};

const handleFile = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    fileError.value = "File tidak boleh lebih dari 20 MB";
    selectedFile.value = null;
    event.target.value = "";
    return;
  }
  fileError.value = "";
  selectedFile.value = file;
};

const submitForm = async () => {
  isSaving.value = true;
  loading.value = true;
  errorMessage.value = "";

  try {
    const formData = new FormData();
    const stokRenew = Number(form.value.stok_max) - Number(form.value.qty);

    formData.append("nama_barang", form.value.nama_barang);
    formData.append("kategori", form.value.kategori);
    formData.append("qty", form.value.qty);
    formData.append("stok_min", form.value.stok_min);
    formData.append("stok_max", form.value.stok_max);
    formData.append("satuan", form.value.satuan);
    formData.append("lokasi", form.value.lokasi);
    formData.append("tanggal", form.value.tanggal);
    formData.append("keterangan", form.value.keterangan);

    formData.append("grup", auth.grup);

    formData.append("renew", stokRenew);
    formData.append("id", auth.id);

    if (selectedFile.value) {
      formData.append("file", selectedFile.value);
    }

    if (form.value.id) {
      await backendApi.put(`/stok1/${form.value.id}`, formData);

      //catat riwayat edit
      const HistData = new FormData();
      HistData.append("nama_barang", form.value.nama_barang);
      HistData.append("tipe_transaksi", "edit");
      HistData.append("qty", form.value.qty);
      HistData.append("qty_after", form.value.qty);
      HistData.append("user", auth.username);
      HistData.append("fullname", auth.fullname);
      HistData.append("grup", auth.grup);
      HistData.append("satuan", form.value.satuan);
      HistData.append("id", auth.id);

      await backendApi.post("/histori", HistData);
    } else {
      await backendApi.post("/stok1", formData);

      //catat riwayat new create
      const HistData = new FormData();
      HistData.append("nama_barang", form.value.nama_barang);
      HistData.append("tipe_transaksi", "new");
      HistData.append("qty", form.value.qty);
      HistData.append("qty_after", form.value.qty);
      HistData.append("user", auth.username);
      HistData.append("fullname", auth.fullname);
      HistData.append("grup", auth.grup);
      HistData.append("satuan", form.value.satuan);
      HistData.append("id", auth.id);

      await backendApi.post("/histori", HistData);
    }
    isModalOpen.value = false;
    modalEditStatus.value = false;
    resetForm();
    await loadNotes();
  } catch (error) {
    console.error("Gagal menyimpan catatan:", error);
    errorMessage.value =
      "Catatan gagal disimpan. Periksa koneksi lalu coba lagi.";
  } finally {
    isSaving.value = false;
    loading.value = false;
  }
};

const submitOutbond = async () => {
  try {
    const formData = new FormData();
    const stokRenew = Number(form.value.stok_max);
    const stokSekarang = Number(form.value.qty);
    const barangKeluar = Number(outbond.value);
    const barangMasuk = Number(inbond.value);
    const hasilMasuk = stokSekarang + barangMasuk;
    const hasilKeluar = stokSekarang - barangKeluar;

    if (barangKeluar > stokSekarang) {
      errorMessage.value = "Stok Tidak Cukup";
      return;
    }
    if (barangKeluar > 0 && barangMasuk > 0) {
      errorMessage.value = "Barang masuk dan keluar tidak boleh diisi bersama";
      return;
    }

    if (barangKeluar !== 0) {
      formData.append("qty", hasilKeluar);
      formData.append("renew", stokRenew - hasilKeluar);
    }
    if (barangMasuk !== 0) {
      formData.append("qty", hasilMasuk);
      formData.append("renew", stokRenew - hasilMasuk);
    }

    formData.append("nama_barang", form.value.nama_barang);
    formData.append("kategori", form.value.kategori);

    formData.append("stok_min", form.value.stok_min);
    formData.append("stok_max", form.value.stok_max);
    formData.append("satuan", form.value.satuan);
    formData.append("lokasi", form.value.lokasi);
    formData.append("tanggal", form.value.tanggal);
    formData.append("keterangan", form.value.keterangan);

    await backendApi.put(`/stok1/${form.value.id}`, formData);

    //catat transaksi
    const HistData = new FormData();
    if (barangKeluar !== 0) {
      HistData.append("tipe_transaksi", "out");
      HistData.append("qty", barangKeluar);
      HistData.append("qty_after", stokSekarang - barangKeluar);
    }
    if (barangMasuk !== 0) {
      HistData.append("tipe_transaksi", "in");
      HistData.append("qty", barangMasuk);
      HistData.append("qty_after", stokSekarang + barangMasuk);
    }

    HistData.append("nama_barang", form.value.nama_barang);
    HistData.append("user", auth.username);
    HistData.append("fullname", auth.fullname);
    HistData.append("grup", auth.grup);
    HistData.append("satuan", form.value.satuan);
    HistData.append("id", auth.id);

    await backendApi.post("/histori", HistData);

    modalEditStatus.value = false;
    resetForm();
    await loadNotes();
  } catch (error) {
    console.error(error);
  }
};

const downloadFile = (key, caption) => {
  const a = document.createElement("a");
  const filename = "DocUtility " + caption;

  a.href = `${API.download}${encodeURIComponent(key)}?filename=${encodeURIComponent(filename)}`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const deleteNote = async (id) => {
  if (!confirm("Yakin ingin menghapus catatan ini?")) {
    return;
  }

  errorMessage.value = "";

  try {
    await backendApi.delete(`/stok1/${id}`);
    await loadNotes();
  } catch (error) {
    console.error("Gagal menghapus catatan:", error);
    errorMessage.value = "Catatan gagal dihapus. Silakan coba lagi.";
  }
};

const Review = (url) => {
  const link = document.createElement("a");

  link.href = url;
  link.download = "";
  link.target = "_blank";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const LogOut = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("fullname");
  localStorage.removeItem("grup");
  localStorage.removeItem("expiredTime");
  window.location.href = "/login";
};

const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];

const resetForm = () => {
  form.value = {
    id: null,
    tanggal: today,
    nama_barang: "",
    kategori: "",
    qty: 0,
    stok_min: 0,
    stok_max: 999,
    satuan: "",
    lokasi: "",
    keterangan: "",
  };
  inbond.value = 0;
  outbond.value = 0;
  selectedFile.value = null;
};

const formatDate = (date) => {
  if (!date) {
    return "Tanpa tanggal";
  }

  const parsedDate = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(parsedDate);
};

const Home = () => {
  window.location.href = "/";
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const isImage = (url) => {
  if (!url) return false;

  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
};
const isVideo = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|mov|avi|mkv)$/i.test(url);
};
const getFileIcon = (url) => {
  if (!url) return "";

  const ext = url.split(".").pop().toLowerCase();

  switch (ext) {
    case "pdf":
      return pdfLogo;

    case "doc":
    case "docx":
      return wordLogo;

    case "xls":
    case "xlsx":
      return ecxlLogo;

    case "ppt":
    case "pptx":
      return pptLogo;

    case "zip":
    case "rar":
    case "7z":
      return zipLogo;
    case "mp3":
      return mp3Logo;
    case "txt":
      return txtLogo;

    default:
      return "";
  }
};

const exportToExcel = () => {
  const data = filteredNotes.value.map((item) => ({
    Tanggal: formatDate(item.tanggal),
    Barang: item.nama_barang,
    Kategori: item.kategori,
    Lokasi: item.lokasi,
    Qty: item.qty,
    Stok_Min: item.stok_min,
    Stok_Max: item.stok_max,
    Restock_need: item.renew,
    Satuan: item.satuan,
    Keterangan: item.keterangan,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = [
    { wch: 17 }, // Tanggal
  ];
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Stok");

  XLSX.writeFile(workbook, `Data Stok_${statusFilter.value || "Semua"}.xlsx`);
};

onMounted(() => {
  loadNotes();

  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div
    v-if="summaryPerform"
    class="modal-backdrop-caption"
    @click.self="tutupSummary"
  >
    <summaryMonth />
  </div>
  <div class="backdrop-loading" v-if="loading"><LoadingContent /></div>

  <ScrollToTopButton v-if="tmblUp" @click="scrollToTop" />
  <main class="notes-app">
    <div class="page-shell">
      <section class="welcome">
        <div>
          <h1>Manajemen Stok</h1>
        </div>

        <div class="note-count">
          <div class="stat-card total" @click="statusFilter = ''">
            <strong>{{ stokSummary.total }}</strong>
            <span>Total Barang</span>
          </div>

          <div class="stat-card completed" @click="statusFilter = 'Aman'">
            <strong>{{ stokSummary.aman }}</strong>
            <span>Stok Aman</span>
          </div>

          <div class="stat-card progress" @click="statusFilter = 'Penuh'">
            <strong>{{ stokSummary.penuh }}</strong>
            <span>Stok Penuh</span>
          </div>

          <div class="stat-card pending" @click="statusFilter = 'Restock'">
            <strong>{{ stokSummary.habis }}</strong>
            <span>Perlu Restock</span>
          </div>
        </div>
      </section>
      <div class="btn-wrap">
        <BtnExport @click="exportToExcel" />
        <reviewHist :judul="'Histori Stok'" @click="viewHistori" />
      </div>

      <section class="notes-section" aria-label="Daftar catatan">
        <div class="section-heading">
          <div class="job-title-wrap">
            <h2>Job List</h2>
            <SwitchView v-model="listView" />
          </div>

          <!--Filter Status-->
          <RadioSelect
            v-model="statusFilter"
            :judul="`All`"
            :judul1="`Aman`"
            :judul2="`Restock`"
            :judul3="`Penuh`"
          />

          <label class="search-box">
            <span class="search-icon" aria-hidden="true">⌕</span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari catatan..."
              aria-label="Cari catatan"
            />
          </label>
        </div>

        <p v-if="errorMessage && !isModalOpen" class="page-alert" role="alert">
          {{ errorMessage }}
        </p>

        <div v-if="isLoading" class="empty-state">
          <span class="state-icon" aria-hidden="true">◌</span>
          <h3>Memuat Data...</h3>
        </div>

        <div
          v-else-if="filteredNotes.length"
          :class="listView ? 'notes-list' : 'notes-grid'"
        >
          <!--View Card Grid-->
          <template v-if="!listView">
            <article
              v-for="item in visibleNotes"
              :key="item.id"
              class="note-card"
            >
              <div class="note-image-wrap" v-if="isImage(item.r2_key)">
                <img
                  class="note-image"
                  :src="API.dokumen + item.r2_key"
                  alt="Barang"
                />

                <div
                  class="image-tag"
                  :class="
                    item.qty === 0
                      ? 'habis'
                      : item.qty <= item.stok_min
                        ? 'pending'
                        : item.qty >= item.stok_max
                          ? 'on-progress'
                          : 'completed'
                  "
                >
                  {{
                    item.qty === 0
                      ? "Habis"
                      : item.qty <= item.stok_min
                        ? "Restock"
                        : item.qty >= item.stok_max
                          ? "Stok Penuh"
                          : "Stok Aman"
                  }}
                </div>
              </div>
              <div v-if="!isImage(item.r2_key)" class="note-image-placeholder">
                <img
                  :src="coretan"
                  @click="Review(API.dokumen + item.r2_key)"
                />
                <div
                  class="image-tag"
                  :class="
                    item.qty === 0
                      ? 'habis'
                      : item.qty <= item.stok_min
                        ? 'pending'
                        : item.qty >= item.stok_max
                          ? 'on-progress'
                          : 'completed'
                  "
                >
                  {{
                    item.qty === 0
                      ? "Habis"
                      : item.qty <= item.stok_min
                        ? "Restock"
                        : item.qty >= item.stok_max
                          ? "Stok Penuh"
                          : "Stok Aman"
                  }}
                </div>
              </div>
              <div class="edit-popup-wrap">
                <editPopUp
                  :user_id="item.user_id"
                  class="card-menu-list"
                  @preview="previewItem(item)"
                  @edit="editData(item)"
                  @hapus="deleteNote(item.id)"
                />
              </div>
              <div class="note-content">
                <p class="note-title">{{ item.nama_barang }}</p>

                <div class="note-info">
                  <div>
                    Kategori: <span>{{ item.kategori }}</span>
                  </div>

                  <div>
                    Stok:
                    <strong>{{ item.qty }}</strong>
                    {{ item.satuan }}
                  </div>

                  <div>Min: {{ item.stok_min }} • Max {{ item.stok_max }}</div>

                  <div>📍 {{ item.lokasi }}</div>
                </div>

                <p class="note-date">Input: {{ formatDate(item.tanggal) }}</p>

                <div class="note-actions">
                  <button
                    class="action-button edit-button"
                    @click="editDataStatus(item)"
                  >
                    Action
                  </button>
                </div>
              </div>
            </article>
          </template>
          <!--View List-->
          <template v-else>
            <article
              v-for="item in visibleNotes"
              :key="item.id"
              class="note-list-item"
            >
              <editPopUp
                :user_id="item.user_id"
                class="card-menu-list"
                @preview="previewItem(item)"
                @edit="editData(item)"
                @hapus="deleteNote(item.id)"
              />

              <div class="list-info">
                <span
                  class="list-status"
                  :class="
                    item.qty === 0
                      ? 'habis'
                      : item.qty <= item.stok_min
                        ? 'pending'
                        : item.qty >= item.stok_max
                          ? 'on-progress'
                          : 'completed'
                  "
                >
                  {{
                    item.qty === 0
                      ? "Habis"
                      : item.qty <= item.stok_min
                        ? "Restock"
                        : item.qty >= item.stok_max
                          ? "Stok Penuh"
                          : "Stok Aman"
                  }}
                </span>

                <h4 class="list-caption">
                  {{ item.nama_barang }}
                </h4>

                <p class="list-detail">Kategori: {{ item.kategori }}</p>

                <p class="list-detail">
                  Stok: <b>{{ item.qty }}</b> {{ item.satuan }}
                </p>

                <p class="list-detail">
                  Min: {{ item.stok_min }} | Max: {{ item.stok_max }}
                </p>

                <p class="list-detail">📍 {{ item.lokasi }}</p>
              </div>
            </article>
          </template>
          <div
            v-if="visibleCount < filteredNotes.length"
            class="load-more-info"
          >
            Scroll ke bawah untuk memuat data berikutnya...
          </div>
        </div>

        <div v-else class="empty-state">
          <span class="state-icon" aria-hidden="true">✎</span>
          <h3>
            {{
              searchQuery ? "Barang tidak ditemukan" : "Belum ada Stok barang"
            }}
          </h3>
          <p>
            {{
              searchQuery
                ? "Coba gunakan kata kunci yang berbeda."
                : "Mulai kumpulkan ide berhargamu."
            }}
          </p>
          <button
            v-if="!searchQuery"
            class="primary-button"
            type="button"
            @click="openCreateModal"
          >
            Buat Stok Baru
          </button>
        </div>
      </section>
    </div>

    <button
      class="floating-add"
      type="button"
      aria-label="Tambah catatan"
      @click="openCreateModal"
    >
      ＋
    </button>

    <!--Modals Preview list-->
    <div
      v-if="showPreviewModal"
      class="modal-backdrop-caption"
      @click.self="closePreviewItem"
    >
      <div class="caption-modal-preview">
        <div
          v-if="selectedItem && isImage(selectedItem.r2_key)"
          class="note-image-wrap-list"
        >
          <img
            class="note-image-list"
            :src="API.dokumen + selectedItem.r2_key"
            alt=""
            @click="Review(API.dokumen + selectedItem.r2_key)"
          />

          <div class="image-tag" :class="selectedItem.status?.toLowerCase()">
            {{ selectedItem.status }}
          </div>
        </div>
        <div
          v-if="selectedItem && isVideo(selectedItem.r2_key)"
          class="note-image-wrap video-preview"
          @click="Review(API.dokumen + selectedItem.r2_key)"
        >
          <video
            class="note-video"
            :src="API.dokumen + selectedItem.r2_key"
            muted
            preload="metadata"
          ></video>

          <div class="play-icon">▶</div>

          <div class="image-tag" :class="selectedItem.status?.toLowerCase()">
            {{ selectedItem.status }}
          </div>
        </div>
        <div
          v-if="selectedItem && getFileIcon(selectedItem.r2_key)"
          class="note-image-placeholder"
        >
          <img
            :src="getFileIcon(selectedItem.url)"
            @click="Review(API.dokumen + selectedItem.r2_key)"
          />
        </div>
        <div class="job-title-wrap">
          <h3>{{ selectedItem.nama_barang }}</h3>
          <DownloadKecil
            v-if="
              isImage(selectedItem.r2_key) ||
              isVideo(selectedItem.r2_key) ||
              getFileIcon(selectedItem.r2_key)
            "
            @click="
              downloadFile(
                selectedItem.r2_key,
                formatDate(selectedItem.tanggal),
              )
            "
          />
        </div>
        <p class="caption-text">
          Stok: <strong>{{ selectedItem.qty }}</strong>
          {{ selectedItem.satuan }}
        </p>
        <p class="caption-text">
          Restock need:
          <strong>{{ selectedItem.renew }}</strong>
          {{ selectedItem.satuan }}
        </p>
        <p class="caption-text" v-if="selectedItem.keterangan">
          Keterangan:
          {{ selectedItem.keterangan }}
        </p>
        <br />
        <p class="caption-text-mark">
          create stok by: {{ selectedItem.user.fullname }}
        </p>
      </div>
    </div>

    <!-- Modals Caption-->
    <div
      v-if="showCaptionModal"
      class="modal-backdrop-caption"
      @click="closeCaptionModal"
    >
      <div class="caption-modal" @click.stop>
        <button class="close-btn" @click="closeCaptionModal">✕</button>

        <h3>Catatan</h3>

        <p class="caption-text">
          {{ selectedCaption }}
        </p>
      </div>
    </div>

    <!-- Modals Create/Edit -->
    <div
      v-if="isModalOpen"
      class="modal-backdrop-caption"
      role="presentation"
      @click.self="closeModal"
    >
      <section
        class="note-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div class="modal-heading">
          <div>
            <p class="eyebrow">ADD</p>
            <h2 id="modal-title">
              {{ form.id ? "Edit catatan" : "Tulis catatan" }}
            </h2>
          </div>
          <button
            class="modal-close"
            type="button"
            aria-label="Tutup form"
            :disabled="isSaving"
            @click="closeModal"
          >
            ×
          </button>
        </div>

        <form class="note-form" @submit.prevent="submitForm">
          <label class="form-field">
            <span>Tanggal Masuk</span>
            <input v-model="form.tanggal" type="date" required />
          </label>

          <label class="form-field">
            <span>Nama Barang</span>
            <input
              v-model="form.nama_barang"
              type="text"
              placeholder="Contoh: Laptop Dell"
              required
            />
          </label>

          <label class="form-field">
            <span>Kategori</span>
            <input
              v-model="form.kategori"
              type="text"
              placeholder="ATK, Elektronik, Furniture"
            />
          </label>

          <label class="form-field">
            <span>Satuan</span>
            <input
              v-model="form.satuan"
              type="text"
              placeholder="Pcs, Box, Jrc"
            />
          </label>

          <div class="stok-grid">
            <label class="form-field">
              <span>Stok Barang</span>
              <input v-model.number="form.qty" type="number" min="0" required />
            </label>

            <label class="form-field">
              <span>Restock poin</span>
              <input
                v-model.number="form.stok_min"
                type="number"
                min="0"
                required
              />
            </label>

            <label class="form-field">
              <span>Stok Maksimum</span>
              <input
                v-model.number="form.stok_max"
                type="number"
                min="0"
                required
              />
            </label>
          </div>

          <label class="form-field">
            <span>Lokasi Penyimpanan</span>
            <input
              v-model="form.lokasi"
              type="text"
              placeholder="Gudang A / Ruang Stok / Rak 01"
            />
          </label>

          <label class="form-field">
            <span
              >Dokumentasi <span class="optional-label">(opsional)</span></span
            >

            <input type="file" accept="image/*" @change="handleFile" />

            <small v-if="selectedFile" class="selected-file">
              {{ selectedFile.name }}
              <br />
              Size:
              {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
            </small>

            <small v-if="fileError" class="error-text">
              {{ fileError }}
            </small>
          </label>

          <label class="form-field">
            <span
              >Keterangan <span class="optional-label">(opsional)</span></span
            >
            <textarea
              v-model="form.keterangan"
              rows="4"
              placeholder="Deskripsi ..."
            ></textarea>
          </label>

          <p v-if="errorMessage" class="form-alert">
            {{ errorMessage }}
          </p>

          <div class="modal-actions">
            <button
              class="secondary-button"
              type="button"
              :disabled="isSaving"
              @click="closeModal"
            >
              Batal
            </button>

            <button class="primary-button" type="submit" :disabled="isSaving">
              {{
                isSaving
                  ? "Menyimpan..."
                  : form.id
                    ? "Simpan Perubahan"
                    : "Save"
              }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <!-- Modals Edit Status -->
    <div
      v-if="modalEditStatus"
      class="modal-backdrop-caption"
      role="presentation"
      @click.self="closeModal"
    >
      <section
        class="note-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div class="modal-heading">
          <div>
            <h2 id="modal-title">Update Stok Barang</h2>
            <h1>{{ form.nama_barang }}</h1>
          </div>
          <button
            class="modal-close"
            type="button"
            aria-label="Tutup form"
            :disabled="isSaving"
            @click="closeModal"
          >
            ×
          </button>
        </div>
        <RadioInOut
          v-model="StokKeluar"
          :judul1="`Barang Keluar`"
          :judul2="`Barang Masuk`"
        />
        <form class="note-form" @submit.prevent="submitOutbond">
          <label class="form-field" v-if="StokKeluar">
            <span>Barang Keluar</span>
            <input type="number" v-model="outbond" min="0" />
          </label>
          <label class="form-field" v-else>
            <span>Barang Masuk</span>
            <input type="number" v-model="inbond" min="0" />
          </label>

          <p>Sisa Stok: {{ sisaStok }}</p>

          <p v-if="errorMessage" class="form-alert" role="alert">
            {{ errorMessage }}
          </p>

          <div class="modal-actions">
            <button class="primary-button" type="submit" :disabled="isSaving">
              Save
            </button>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<style scoped>
.notes-app {
  --blue: #1877f2;
  --ink: #fafbfd;
  --muted: #000000;
  --line: #829cc1;
  --text-mdl: #c4cad3;
  min-height: 100vh;
  color: var(--ink);
  font-family: Inter, "Segoe UI", sans-serif;
  font-size: 15px;
  letter-spacing: 0;
}

.topbar {
  position: sticky;
  z-index: 5;
  top: 0;
  background: rgb(59, 59, 97);
  box-shadow: 0 2px 12px rgb(28 46 74 / 7%);
}

.topbar-inner {
  width: calc(100% - 40px);
  max-width: 1800px;
  height: 70px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
  font-size: 20px;
  font-weight: 750;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
}

.brand-mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 12px;
  background: var(--blue);
  color: var(--ink);
  font-size: 20px;
  font-weight: 800;
}

.topbar-label {
  color: #8893a4;
  font-size: 13px;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  background: var(--blue);
  color: white;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  transition:
    background 160ms ease,
    transform 160ms ease;
}

.topbar-add {
  padding: 11px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  background: red;
  color: white;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  transition:
    background 160ms ease,
    transform 160ms ease;
}

.topbar-add span {
  font-size: 20px;
  line-height: 15px;
}

.topbar-add:hover {
  transform: translateY(-1px);
  background: #c24a4a;
}
.primary-button:hover {
  transform: translateY(-1px);
  background: #0967df;
}

.page-shell {
  width: 95%;
  max-width: unset;
  margin: 0 auto;
}

.welcome {
  display: flex;
  min-height: 218px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--text-mdl);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.25px;
}

.welcome h1 {
  margin: 0;
  color: var(--text-mdl);
  font-size: clamp(28px, 4vw, 38px);
  font-weight: 750;
  letter-spacing: -1.2px;
  line-height: 1.2;
}

.welcome-copy {
  margin-top: 10px;
  color: var(--muted);
  font-size: 15px;
}

.note-count {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  width: 40%;
  user-select: none;
  -webkit-user-select: none;
}

.stat-card {
  padding: 8px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-card strong {
  display: block;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-card span {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.85;
}

/* Total */
.total {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

/* Complete */
.completed {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

/* On Progress */
.progress {
  background: linear-gradient(135deg, #97f50b, #d97706);
  color: white;
}

/* Pending */
.pending {
  background: linear-gradient(135deg, #ef5e44, #dc2626);
  color: white;
}
.habis {
  background: linear-gradient(135deg, #ef5e44, #9926dc);
  color: white;
}
.performa {
  background: linear-gradient(135deg, rgb(251, 251, 251), #565c69);
  color: white;
}
@media (max-width: 768px) {
  .note-count {
    grid-template-columns: repeat(2, 1fr);
    width: 60%;
  }
  .stat-card strong {
    font-size: 12px;
    font-weight: 700;
  }

  .stat-card span {
    font-size: 5px;
    font-weight: 300;
  }
}

.count-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: #eaf2ff;
  color: var(--blue);
  font-size: 22px;
}

.note-count strong,
.note-count div > span {
  display: block;
}

.note-count strong {
  color: #24334a;
  font-size: 19px;
  line-height: 1.2;
}

.note-count div > span {
  margin-top: 3px;
  color: black;
  font-size: 12px;
}

.notes-section {
  padding: 26px;
  border: 1px solid #404347;
  border-radius: 18px;
  background: rgb(13, 16, 37);
  box-shadow: 0 8px 28px rgb(35 54 83 / 4%);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.section-heading h2 {
  margin: 0;
  color: #c4cad3;
  font-size: 21px;
  font-weight: 730;
  letter-spacing: -0.35px;
}

.section-heading p {
  margin-top: 5px;
  color: var(--muted);
  font-size: 13px;
}

.search-box {
  display: flex;
  width: min(280px, 100%);
  height: 42px;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fbfcfe;
  box-sizing: border-box;
}

.search-icon {
  color: #8b97a9;
  font-size: 23px;
  line-height: 1;
  transform: rotate(-20deg);
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--bg);
  font: inherit;
  font-size: 13px;
}

.search-box input::placeholder {
  color: black;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 20px;
}

.note-card {
  overflow: visible;
  border: 1px solid #e9eef5;
  border-radius: 14px;
  background: #fff;
  transform: translateY(0px);

  transition: transform 180ms ease;
}

.note-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 26px rgb(35 54 83 / 10%);
}

.note-image-wrap,
.note-image-placeholder {
  position: relative;
  height: 190px;
  overflow: hidden;
  display: block;
  border-radius: 14px;
  background: linear-gradient(135deg, #e9f1ff, #f8efff);
}
.note-image-wrap-list {
  position: relative;
  height: 190px;
  overflow: hidden;
  background: linear-gradient(135deg, #e9f1ff, #f8efff);
}

.note-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}
.note-image-list {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.note-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #8098c5;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.note-image-placeholder span:first-child {
  font-size: 24px;
}

.note-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #232121;
}

.note-info {
  font-size: 14px;
  line-height: 1.6;
  color: #232121;
}

.note-info div {
  margin-bottom: 2px;
}

.note-info strong {
  color: #022cff;
  font-weight: 700;
}
.note-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;
}
.note-fullname {
  margin-left: 0;
  text-decoration: underline;
  color: black;
  font-size: 12px;
}

.note-date span {
  font-size: 15px;
}

.note-caption {
  display: -webkit-box;
  min-height: 66px;
  overflow: hidden;
  margin: 11px 0 15px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
}

.note-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #eff2f6;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  flex: 1;
  border: 1px solid #e8edf4;
  border-radius: 8px;
  background: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition:
    background 150ms ease,
    border-color 150ms ease;
}

.edit-button {
  background: #2563eb;
  color: white;
}

.edit-button:hover {
  background: #1d4ed8;
}

.delete-button {
  background: #dc2626;
  color: white;
}

.delete-button:hover {
  background: #b91c1c;
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
  color: var(--blue);
  font-size: 27px;
}

.empty-state h3 {
  margin: 17px 0 5px;
  color: var(--text-h);
  font-size: 17px;
}

.empty-state p {
  margin-bottom: 17px;
  color: var(--text-h);
  font-size: 13px;
}

.primary-button {
  min-height: 42px;
  padding: 0 17px;
}

.secondary-button {
  min-height: 42px;
  padding: 0 17px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #59677b;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.secondary-button:hover {
  background: #f7f9fc;
}

.primary-button:disabled,
.secondary-button:disabled,
.modal-close:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.page-alert,
.form-alert {
  padding: 11px 13px;
  border: 1px solid #f3c9ce;
  border-radius: 9px;
  background: #fff5f6;
  color: #b6404d;
  font-size: 13px;
}

.page-alert {
  margin-bottom: 18px;
}

.floating-add {
  position: fixed;
  right: 30px;
  bottom: 28px;

  z-index: 9;
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--blue);
  box-shadow: 0 7px 20px rgb(24 119 242 / 35%);
  color: white;
  font-size: 30px;
  cursor: pointer;
  transition: transform 160ms ease;
}

.floating-add:hover {
  transform: scale(1.06);
}

.modal-backdrop {
  position: fixed;
  z-index: 10;
  inset: 0;
  display: grid;
  overflow-y: auto;
  place-items: center;
  padding: 24px;
  background: rgb(22 34 52 / 52%);
  backdrop-filter: blur(3px);
}

.note-modal {
  width: min(100%, 520px);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(76, 139, 160) rgba(255, 255, 255, 0);
  padding: 27px;
  border: 1px solid rgb(255 255 255 / 70%);
  border-radius: 18px;
  background: rgba(29, 73, 99, 0.662);
  box-shadow: 0 24px 80px rgb(20 33 52 / 24%);
  box-sizing: border-box;
  animation: modal-in 180ms ease-out;

  @media (max-width: 600px) {
    position: relative;
    top: -10px;
  }
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.modal-heading h2 {
  margin: 0;
  color: var(--text-mdl);
  font-size: 24px;
  font-weight: 750;
  letter-spacing: -0.5px;
}

.modal-subtitle {
  margin-top: 6px;
  color: var(--muted);
  font-size: 13px;
}

.modal-close {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #f1f4f8;
  color: #748195;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.modal-close:hover {
  background: #e7ecf3;
}

.note-form {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text-mdl);
  font-size: 13px;
  font-weight: 650;
}

.form-field input:not([type="file"]),
.form-field textarea {
  width: 100%;
  min-height: 43px;
  padding: 10px 12px;
  border: 1px solid #dfe6ef;
  border-radius: 9px;
  outline: 0;
  background: #fbfcfe;
  color: #2e3c51;
  font: inherit;
  font-size: 14px;
  box-sizing: border-box;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.form-field textarea {
  min-height: 126px;
  resize: vertical;
  line-height: 1.5;
}

.form-field select {
  color: #000000;
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: #8bbaff;
  box-shadow: 0 0 0 3px rgb(24 119 242 / 11%);
}

.form-field textarea::placeholder {
  color: #a1aab8;
  font-weight: 400;
}

.form-field input[type="file"] {
  width: 100%;
  padding: 11px;
  border: 1px dashed #cdd8e6;
  border-radius: 9px;
  background: #fbfcfe;
  color: #748195;
  font: inherit;
  font-size: 12px;
  box-sizing: border-box;
}

.optional-label {
  color: #97a1af;
  font-weight: 400;
}

.selected-file {
  color: #aaaeb3;
  font-size: 12px;
  font-weight: 400;
  overflow-wrap: anywhere;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 3px;
}

@media (max-width: 850px) {
  .notes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .topbar-inner,
  .page-shell {
    width: min(100% - 30px, 520px);
  }

  .topbar-inner {
    height: 62px;
  }

  .brand {
    font-size: 17px;
  }

  .brand-mark {
    width: 32px;
    height: 32px;
  }

  .topbar-label {
    display: none;
  }

  .topbar-add {
    padding: 9px 11px;
    font-size: 12px;
  }

  .welcome {
    min-height: unset;
    align-items: flex-start;
    flex-direction: column;
    gap: 17px;
    padding: 30px 0 22px;
  }

  .welcome-copy {
    max-width: 310px;
    font-size: 13px;
  }

  .note-count {
    min-width: 0;
    padding: 10px 13px;
  }

  .count-icon {
    width: 36px;
    height: 36px;
  }

  .notes-section {
    padding: 18px 14px;
    border-radius: 14px;
  }

  .section-heading {
    align-items: stretch;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 18px;
  }

  .search-box {
    width: 100%;
  }

  .notes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .note-card {
    width: 140px;
    height: 300px;
  }

  .note-image-wrap,
  .note-image-placeholder {
    height: 90px;
  }

  .note-date,
  .note-info {
    font-size: 9px;
    font-weight: 500;
  }

  .floating-add {
    right: 18px;
    bottom: 18px;
    width: 52px;
    height: 52px;
  }

  .modal-backdrop {
    align-items: end;
    padding: 10px;
  }

  .note-modal {
    max-height: calc(100vh - 20px);
    padding: 22px 18px;
    border-radius: 17px;
  }

  .modal-heading h2 {
    font-size: 21px;
  }
}

/*
  Caption Modal
*/
.preview-btn {
  display: block;
  margin-top: 8px;
  margin-left: auto;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #585f6b;
  color: white;
  font-size: 13px;
}

.modal-backdrop-caption {
  position: fixed;
  inset: 0;
  background: rgb(22 34 52 / 52%);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.backdrop-loading {
  position: fixed;
  inset: 0;
  background: rgb(22 34 52 / 52%);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
}

.caption-modal {
  width: min(90%, 600px);
  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
  background: white;
  color: #333;
  border-radius: 12px;
  padding: 20px;
  position: relative;
}
.caption-modal-preview {
  width: min(90%, 300px);
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
  background: white;
  color: #333;
  border-radius: 12px;
  padding: 20px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: rgb(183, 25, 25);
  font-size: 20px;
  cursor: pointer;
}

.caption-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
}
.caption-text-mark {
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 11px;
  color: #333;
}

/**Selektor status */
.form-field select {
  width: 100%;
  min-height: 43px;
  padding: 10px 12px;
  border: 1px solid #dfe6ef;
  border-radius: 9px;
  background: #fbfcfe;
}

.image-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 10px;
  border-radius: 20px;
  font-weight: 700;
  color: white;
}
@media (max-width: 600px) {
  .image-tag {
    padding: 1px 5px;
    font-weight: 500;
    font-size: 11px;
  }
}

.on-progress {
  background: #ff9800;
}

.completed {
  background: #22c55e;
}

.pending {
  background: #ef4444;
}

/**Scroll kebawh lagi... */
.load-more-info {
  text-align: center;
  padding: 20px;
  color: #ffffff;
  font-size: 14px;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  position: relative;
  padding: 14px 16px;
  border-radius: 12px;
  background: white;
}

.card-menu-list {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
}

.list-info {
  flex: 1;
  min-width: 0;
}

.list-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.list-actions .action-button,
.preview-list-btn {
  min-width: 90px;
  height: 36px;
  padding: 0 12px;

  border: none;
  border-radius: 8px;

  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  transition: 0.2s ease;
}
@media (max-width: 700px) {
  .note-list-item {
    flex-direction: column;
    align-items: stretch;
  }

  .list-actions {
    width: 100%;
  }

  .list-actions button {
    flex: 1;
  }
}

.list-caption {
  margin: 0;
  color: black;
  font-size: 14px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-detail {
  margin: 0;
  color: black;
  font-size: 14px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-status {
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;

  font-size: 12px;
  font-weight: 700;
  color: white;
}
.list-status-edit {
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: white;
  background: #818181;
}

.preview-list-btn {
  border: none;
  padding: 8px 14px;
  border-radius: 8px;

  background: #102949;
  color: white;
  cursor: pointer;
}

.preview-list-btn:hover {
  background: #000000;
}

.job-title-wrap {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-wrap {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  gap: 0;
}

.job-title-wrap h2 {
  margin: 0;
}
@media (max-width: 600px) {
  .job-title-wrap {
    width: 100%;
    justify-content: space-between;
    gap: 0;
  }
}

.download-preview {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
}

.video-preview {
  position: relative;
  cursor: pointer;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.error-text {
  color: #ff4d4f;
  margin-top: 5px;
  display: block;
}

.stok-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

@media (max-width: 700px) {
  .stok-grid {
    grid-template-columns: 1fr;
  }
}
</style>
