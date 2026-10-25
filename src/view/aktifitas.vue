<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { backendApi, API } from "../services/api.js";
import { useAuthStore } from "../stores/auth.js";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
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
import RadioFormulir from "../components/RadioutkForm.vue";
import summaryMonth from "../components/ChardPerform.vue";
import SwitchView from "../components/SwitchView.vue";
import BtnExport from "../components/ExportBtn.vue";
import editPopUp from "../components/popUpDropdown.vue";

const auth = useAuthStore();
const notes = ref([]);
const mesinList = ref([]);
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
const visibleCount = ref(6); //scroll max
const summaryPerform = ref(false);
const listView = ref(true);
const showPreviewModal = ref(false);
const selectedItem = ref(null);
const modalEditStatus = ref(false);
const deteksiTahun = ref(new Date().getFullYear().toString()); //ini utk performa berubah tiap tahun

const previewItem = (item) => {
  selectedItem.value = item;
  showPreviewModal.value = true;
};

const closePreviewItem = () => {
  showPreviewModal.value = false;
  selectedItem.value = null;
};

function bukaSummary() {
  summaryPerform.value = true;
}
const tutupSummary = () => {
  summaryPerform.value = false;
};

const previewCaption = (item) => {
  selectedCaption.value = item;
  showCaptionModal.value = true;
};

const closeCaptionModal = () => {
  showCaptionModal.value = false;
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
  deskripsi: "",
  tanggal: "",
  shift: "",
  grup_shift: "",
  mesin: "",
  rootcause: "",
  statusMesin: "",
  status: "",
});

//reduce jmlah status Tahun ini...berubah tiap tahun
const tahunIni = computed(() => {
  const query = deteksiTahun.value.toLowerCase();

  let result = [...notes.value];

  if (auth.grup) {
    result = result.filter((note) => note.grup === auth.grup);
  }

  if (query) {
    result = result.filter((note) =>
      `${note.caption || ""} ${note.tanggal || ""}`
        .toLowerCase()
        .includes(query),
    );
  }

  return result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
});
const statusThisYear = computed(() => {
  const total = tahunIni.value.length;

  const completed = tahunIni.value.filter(
    (item) => item.status === "Completed",
  ).length;

  const onProgress = tahunIni.value.filter(
    (item) => item.status === "On Progress",
  ).length;

  const pending = tahunIni.value.filter(
    (item) => item.status === "Pending",
  ).length;

  return {
    total,
    completed,
    onProgress,
    pending,
  };
});
const statusMesinThisYear = computed(() => {
  const total = tahunIni.value.length;

  const DT = tahunIni.value.filter(
    (item) => item.status === "Completed",
  ).length;

  const NDT = tahunIni.value.filter(
    (item) => item.status === "On Progress",
  ).length;

  const MNTR = tahunIni.value.filter(
    (item) => item.status === "Pending",
  ).length;

  return {
    total,
    DT,
    NDT,
    MNTR,
  };
});
//Persentase
const completedPersen = computed(() => {
  const total = tahunIni.value.length;

  if (!total) return 0;

  const completed = tahunIni.value.filter(
    (item) => item.status === "Completed",
  ).length;

  return ((completed / total) * 100).toFixed(2);
});

//Urutkan array berdasarkan tanggal dari terbaru ke terlama & status
const filteredNotes = computed(() => {
  const query = searchQuery.value.toLowerCase();

  let result = [...notes.value];

  // hanya tampilkan data milik user login
  if (auth.grup) {
    result = result.filter((note) => note.grup === auth.grup);
  }

  if (query) {
    result = result.filter((note) =>
      `${note.user.fullname || ""} ${note.caption || ""} ${note.tanggal || ""}`
        .toLowerCase()
        .includes(query),
    );
  }

  if (statusFilter.value) {
    result = result.filter(
      (note) =>
        note.status === statusFilter.value ||
        note.status_mesin === statusFilter.value,
    );
  }

  return result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
});

const loadDaftarMesin = async () => {
  try {
    const response = await backendApi.get("/mtc/mesin", { timeout: 30000 });
    mesinList.value = response.data.results || [];
  } catch (err) {
    console.error(err);
  }
};

const loadNotes = async () => {
  loading.value = true;
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await backendApi.get("/mtc", {
      params: { user_id: auth.id },
      timeout: 30000,
    });
    notes.value = response.data.results || [];
  } catch (error) {
    console.error("Gagal memuat catatan:", error);
    errorMessage.value = "Error Database.";
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
    deskripsi: item.deskripsi || "",
    tanggal: item.tanggal?.replace(" ", "T").slice(0, 16) || "",
    shift: item.shift || "",
    grup_shift: item.grup_shift || "",
    mesin: item.mesin || "",
    rootcause: item.rootcause || "",
    statusMesin: item.status_mesin || "",

    status: item.status || "On Progress",
  };
  selectedFile.value = null;
  errorMessage.value = "";
  isModalOpen.value = true;
};
const editDataStatus = (item) => {
  form.value = {
    id: item.id,
    deskripsi: item.deskripsi || "",
    tanggal: item.tanggal?.replace(" ", "T").slice(0, 16) || "",
    shift: item.shift || "",
    grup_shift: item.grup_shift || "",
    mesin: item.mesin || "",
    rootcause: item.rootcause || "",
    statusMesin: item.status_mesin || "",

    status: item.status || "On Progress",
  };
  selectedFile.value = null;
  errorMessage.value = "";
  modalEditStatus.value = true;
};

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
    const datetime = form.value.tanggal.replace("T", " ") + ":00";

    formData.append("tanggal", datetime);
    formData.append("shift", form.value.shift);
    formData.append("grup_shift", form.value.grup_shift);
    formData.append("statusMesin", form.value.statusMesin);
    formData.append("deskripsi", form.value.deskripsi || "");
    formData.append("rootcause", form.value.rootcause || "");
    formData.append("status", form.value.status);
    formData.append("mesin", form.value.mesin);

    formData.append("id", auth.id);
    formData.append("closebyid", auth.id);

    if (selectedFile.value) {
      formData.append("file", selectedFile.value);
    }

    if (form.value.id) {
      await backendApi.put(`/mtc/${form.value.id}`, formData);
    } else {
      await backendApi.post("/mtc", formData);
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

const downloadFile = (key, caption) => {
  const a = document.createElement("a");
  const filename = "Aktifitas " + caption;

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
    await backendApi.delete(`/mtc/${id}`);
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

const Timenow = new Date();
Timenow.setMinutes(Timenow.getMinutes() - Timenow.getTimezoneOffset());

const today = Timenow.toISOString().slice(0, 16);

const resetForm = () => {
  form.value = {
    id: null,
    shift: "Non Shift",
    grup_shift: "NS",
    statusMesin: "Downtime",
    tanggal: today,
    status: "On Progress",
    mesin: "",
  };
  selectedFile.value = null;
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
    Tanggal: formatDateOnly(item.tanggal),
    Shift: item.shift,
    Grup: item.grup_shift,
    Machine: item.mesin,
    Description: item.deskripsi,
    Root_Cause: item.rootcause,
    Start_Time: formatDateGetJam(item.tanggal),
    End_Time: formatDateGetJam(item.finish),
    Status: item.status_mesin,
    Created: formatJam(item.created_at),
    Nama: item.user.fullname,
    UpdateBy: item.closeby.fullname,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = [
    { wch: 17 }, // Tanggal
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
  ];
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Catatan");

  XLSX.writeFile(workbook, `Logbook MTC_${statusFilter.value || "Semua"}.xlsx`);
};

const formatDateOnly = (date) => {
  if (!date) {
    return "Tanpa tanggal";
  }

  const parsedDate = new Date(date.replace(" ", "T"));
  return Number.isNaN(parsedDate.getTime())
    ? date
    : new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
        .format(parsedDate)
        .replace(" pukul ", " ");
};

const formatDateGetJam = (date) => {
  if (!date) {
    return "Tanpa tanggal";
  }

  const parsedDate = new Date(date.replace(" ", "T"));
  return Number.isNaN(parsedDate.getTime())
    ? date
    : new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(parsedDate)
        .replace(" pukul ", " ");
};

const formatDate = (date) => {
  if (!date) {
    return "Tanpa tanggal";
  }

  const parsedDate = new Date(date.replace(" ", "T"));
  return Number.isNaN(parsedDate.getTime())
    ? date
    : new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(parsedDate)
        .replace(" pukul ", " ") + " WIB";
};

const formatDateIndo = (date) => {
  const d = new Date(date);

  return (
    d.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
};

const formatJam = (date) => {
  const d = new Date(date.replace(" ", "T") + "Z");

  return (
    d.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
};

const lamaPengerjaan = (mulai, selesai) => {
  if (!mulai) return "-";

  const start = new Date(mulai);

  const end = selesai ? new Date(selesai) : Date.now();

  const diffMs = end - start;

  const hari = Math.floor(diffMs / 86400000);
  const jam = Math.floor((diffMs % 86400000) / 3600000);
  const menit = Math.floor((diffMs % 3600000) / 60000);

  const waktu =
    hari > 0
      ? `${hari} hari ${jam ? jam + " jam" : ""}`
      : jam > 0
        ? `${jam} jam ${menit} menit`
        : menit > 0
          ? `${menit} menit`
          : "";

  return selesai ? waktu : `${waktu} (Open)`;
};

onMounted(() => {
  loadNotes();
  loadDaftarMesin();
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
          <h1>Manajemen Aktifitas</h1>
        </div>
      </section>

      <div class="note-count">
        <div class="stat-card performa" @click="bukaSummary">
          <strong>{{ completedPersen }} %</strong>
          <span>Performa</span>
        </div>

        <div class="stat-card pending" @click="statusFilter = `Downtime`">
          <strong>{{ statusMesinThisYear.DT }}</strong>
          <span>Downtime</span>
        </div>

        <div class="stat-card completed" @click="statusFilter = `No Downtime`">
          <strong>{{ statusMesinThisYear.NDT }}</strong>
          <span>No Downtime</span>
        </div>

        <div class="stat-card progress" @click="statusFilter = `Monitoring`">
          <strong>{{ statusMesinThisYear.MNTR }}</strong>
          <span>Monitoring</span>
        </div>

        <div class="stat-card completed" @click="statusFilter = `Completed`">
          <strong>{{ statusThisYear.completed }}</strong>
          <span>Completed</span>
        </div>

        <div class="stat-card progress" @click="statusFilter = `On Progress`">
          <strong>{{ statusThisYear.onProgress }}</strong>
          <span>On Progress</span>
        </div>

        <div class="stat-card pending" @click="statusFilter = `Pending`">
          <strong>{{ statusThisYear.pending }}</strong>
          <span>Pending</span>
        </div>
      </div>

      <BtnExport @click="exportToExcel" />
      <section class="notes-section" aria-label="Daftar catatan">
        <div class="section-heading">
          <div class="job-title-wrap">
            <h2>Job List</h2>
            <SwitchView v-model="listView" />
          </div>
          <a
            v-if="statusFilter"
            @click="statusFilter = ``"
            style="cursor: pointer; text-decoration: underline"
            >Reset Kategori</a
          >
          <!--Filter Status-->
          <h2>Kategori: {{ statusFilter ? statusFilter : "All" }}</h2>

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
              <div v-if="isImage(item.r2_key)" class="note-image-wrap">
                <img
                  class="note-image"
                  :src="API.dokumen + item.r2_key"
                  alt="Gambar catatan"
                  @click="Review(API.dokumen + item.r2_key)"
                />
                <div class="image-tag" :class="item.status?.toLowerCase()">
                  {{ item.status }}
                </div>
              </div>
              <div
                v-if="isVideo(item.r2_key)"
                class="note-image-wrap video-preview"
                @click="Review(API.dokumen + item.r2_key)"
              >
                <video
                  class="note-video"
                  :src="API.dokumen + item.r2_key"
                  muted
                  preload="metadata"
                ></video>

                <div class="play-icon">▶</div>

                <div class="image-tag" :class="item.status?.toLowerCase()">
                  {{ item.status }}
                </div>
              </div>

              <div
                v-if="getFileIcon(item.r2_key)"
                class="note-image-placeholder"
              >
                <img
                  :src="getFileIcon(item.r2_key)"
                  @click="Review(API.dokumen + item.r2_key)"
                />
                <div class="image-tag" :class="item.status?.toLowerCase()">
                  {{ item.status }}
                </div>
              </div>
              <div
                v-if="!isVideo(item.r2_key) && !isImage(item.r2_key)"
                class="note-image-placeholder"
              >
                <img :src="coretan" />
                <div class="image-tag" :class="item.status?.toLowerCase()">
                  {{ item.status }}
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
                <p class="note-date">
                  {{ formatDate(item.tanggal) }}
                </p>
                <p v-if="item.user.fullname" class="grid-fullname">
                  by {{ item.user.fullname }}
                </p>
                <p class="note-caption">
                  {{
                    item.deskripsi?.length > 50
                      ? item.deskripsi.substring(0, 50) + "..."
                      : item.deskripsi
                  }}
                </p>
                <strong class="note-what">Root Cause:</strong>
                <p class="note-caption">
                  {{
                    item.rootcause?.length > 50
                      ? item.rootcause.substring(0, 50) + "..."
                      : item.rootcause
                  }}
                </p>
                <button class="preview-btn" @click="previewCaption(item)">
                  Baca Selengkapnya ...
                </button>
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
                <div class="status-user">
                  <span
                    class="list-status"
                    :class="item.status_mesin?.toLowerCase().replace(' ', '-')"
                  >
                    {{ item.status_mesin }}
                  </span>
                  <span
                    class="list-status-dot"
                    :class="item.status?.toLowerCase().replace(' ', '-')"
                  >
                  </span>
                  <button
                    class="list-status-edit"
                    @click="editDataStatus(item)"
                  >
                    <span aria-hidden="true">✎</span>
                  </button>
                  <p v-if="item.user.fullname" class="list-lamawaktu">
                    {{ lamaPengerjaan(item.tanggal, item.finish) }}
                  </p>
                </div>
                <p class="time-stamp">
                  {{ formatDate(item.tanggal) }} by {{ item.user.fullname }} |
                  {{ item.shift }}
                  {{
                    item.grup_shift === "NS" ? "" : "| Grup " + item.grup_shift
                  }}
                </p>
                <p class="time-stamp">Mesin: {{ item.mesin }}</p>

                <h4 class="list-caption">
                  {{
                    item.deskripsi?.length > 150
                      ? item.deskripsi.substring(0, 150) + "..."
                      : item.deskripsi
                  }}
                </h4>
                <br />
                <p class="time-stamp">Root Cause:</p>
                <h4 class="list-caption">
                  {{
                    item.rootcause?.length > 150
                      ? item.rootcause.substring(0, 150) + "..."
                      : item.rootcause
                  }}
                </h4>
                <br />
                <p class="time-stamp" v-if="item.finish">
                  (Close) {{ formatDateIndo(item.finish) }} by
                  <strong>{{ item.closeby.fullname }}</strong>
                </p>
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
            {{ searchQuery ? "Catatan tidak ditemukan" : "Belum ada catatan" }}
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
            Buat catatan pertama
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
          v-else-if="selectedItem && getFileIcon(selectedItem.url)"
          class="note-image-placeholder"
        >
          <img
            :src="getFileIcon(selectedItem.r2_key)"
            @click="Review(API.dokumen + selectedItem.r2_key)"
          />
        </div>

        <div class="job-title-wrap">
          <h3>Mesin: {{ selectedItem.mesin }}</h3>
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
        <strong>Deskripsi:</strong>
        <p class="caption-text">
          {{ selectedItem?.deskripsi }}
        </p>
        <strong>Root Cause:</strong>
        <p class="caption-text">
          {{ selectedItem?.rootcause }}
        </p>
        <p class="caption-text-mark">
          created by: {{ selectedItem.user.fullname }}
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

        <h3>{{ selectedCaption.mesin }}</h3>
        <p class="caption-tgl">
          {{ formatDate(selectedCaption.tanggal) }}
        </p>
        <p class="caption-text">
          {{ selectedCaption.deskripsi }}
        </p>
        <strong>Root Cause:</strong>
        <p class="caption-text">
          {{ selectedCaption.rootcause }}
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
          <label class="form-field" for="note-date">
            <span>Tanggal</span>
            <input
              id="note-date"
              v-model="form.tanggal"
              type="datetime-local"
              required
            />
          </label>

          <div class="input-grid">
            <label class="form-field">
              <span>Shift</span>
              <select v-model="form.shift">
                <option>Shift 1</option>
                <option>Shift 2</option>
                <option>Shift 3</option>
                <option>Non Shift</option>
              </select>
            </label>
            <label class="form-field">
              <span>Grup</span>
              <select v-model="form.grup_shift">
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
                <option>NS</option>
              </select>
            </label>
            <label class="form-field">
              <span>Status</span>
              <select v-model="form.statusMesin">
                <option>Downtime</option>
                <option>No Downtime</option>
                <option>Monitoring</option>
              </select>
            </label>
          </div>
          <label class="form-field">
            <span>Machine</span>
            <select v-model="form.mesin">
              <option value="">Pilih Mesin</option>
              <option
                v-for="item in mesinList"
                :key="item.id"
                :value="item.caption"
              >
                {{ item.caption }}
              </option>
            </select>
          </label>
          <label class="form-field">
            <span>Status Pekerjaan</span>
            <RadioFormulir
              v-model="form.status"
              :judul1="`On Progress`"
              :judul2="`Completed`"
              :judul3="`Pending`"
            />
          </label>
          <label class="form-field" for="note-file">
            <span
              >Dokumentasi <span class="optional-label">(opsional)</span></span
            >
            <input id="note-file" type="file" @change="handleFile" />
            <small v-if="selectedFile" class="selected-file"
              >{{ selectedFile.name }} <br />Size:
              {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
            </small>
            <small v-if="fileError" class="error-text">
              {{ fileError }}
            </small>
          </label>
          <label class="form-field" for="note-caption">
            <span>Description</span>
            <textarea
              id="note-caption"
              v-model="form.deskripsi"
              rows="5"
              placeholder="Tulis deskripsi di sini..."
              required
            ></textarea>
          </label>
          <label class="form-field" for="note-caption">
            <span>Root Cause</span>
            <textarea
              v-model="form.rootcause"
              placeholder="Tulis root cause di sini..."
            ></textarea>
          </label>

          <p v-if="errorMessage" class="form-alert" role="alert">
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
                    ? "Simpan perubahan"
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
            <h2 id="modal-title">Update Status Pekerjaan</h2>
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
            <span>Status Pekerjaan</span>
            <RadioFormulir
              v-model="form.status"
              :judul1="`On Progress`"
              :judul2="`Completed`"
              :judul3="`Pending`"
            />
          </label>

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
  grid-template-columns: repeat(7, 1fr);
  gap: 14px;
  width: 100%;
  margin-bottom: 70px;
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
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

/* Pending */
.pending {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}
.performa {
  background: linear-gradient(135deg, rgb(251, 251, 251), #565c69);
  color: white;
}
@media (max-width: 768px) {
  .note-count {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
    margin-bottom: 24px;

    /* Hilangkan scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .note-count > * {
    flex: 0 0 100px; /* lebar card */
    min-width: 100px;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.note-card {
  overflow: visible;
  border: 1px solid #e9eef5;
  border-radius: 14px;
  background: #fff;
  transform: translateY(0px);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.note-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 26px rgb(35 54 83 / 10%);
}

.note-image-wrap,
.note-image-placeholder {
  position: relative;
  display: block;
  border-radius: 14px;
  height: 190px;
  overflow: hidden;
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
  object-fit: cover;
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
}

.note-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
}

.note-date span {
  font-size: 15px;
}

.note-what {
  color: #000000;
}
.note-caption {
  display: -webkit-box;
  min-height: 66px;
  overflow: hidden;
  margin: 11px 0 15px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.note-actions {
  display: flex;
  gap: 8px;
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
    height: 260px;
  }

  .note-date,
  .note-info {
    font-size: 9px;
  }

  .note-image-wrap,
  .note-image-placeholder {
    height: 90px;
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

  .preview-btn {
    position: absolute;
    width: 130px;
    top: 200px;
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

.list-status-dot {
  width: 19px;
  height: 19px;
  border-radius: 50%;
  animation: pulse-glow 2.5s infinite ease-in-out;
}

.list-status-dot.on.progress,
.list-status-dot.on-progress {
  background: #ff9800;
  box-shadow: 0 0 8px #ff9800;
}

.list-status-dot.completed {
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
}

.list-status-dot.pending {
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

@keyframes pulse-glow {
  0% {
    opacity: 0.4;
    transform: scale(0.95);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }

  100% {
    opacity: 0.4;
    transform: scale(0.95);
  }
}

.monitoring {
  background: #ff9800;
}

.no-downtime {
  background: #22c55e;
}

.downtime {
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

.status-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-lamawaktu {
  margin-left: 10px;
  color: black;
}
.grid-fullname {
  margin-left: 0;
  color: black;
}
.time-stamp {
  margin-left: 0;
  color: black;
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

.job-title-wrap h2 {
  margin: 0;
}
@media (max-width: 700px) {
  .job-title-wrap {
    width: 100%;
    justify-content: space-between;
    gap: 0;
  }

  .list-status {
    font-size: 0.5rem;
  }
  .list-lamawaktu {
    font-size: 0.7rem;
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

.input-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  width: 100%;
  gap: 16px;
  margin-bottom: 24px;
}
</style>
