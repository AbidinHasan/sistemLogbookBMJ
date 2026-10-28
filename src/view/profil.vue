<script setup>
import { ref, onMounted, computed } from "vue";
import { backendApi } from "../services/api";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import konfirmasi from "../components/comfirmLogin.vue";
import LoadingSend from "../components/LoadingContent.vue";

const router = useRouter();
const auth = useAuthStore();
const users = ref([]);
const mesinList = ref([]);
const usersGrup = ref([]);
const showPassword = ref(false);
const isSaving = ref(false);
const isModalOpenKonfir = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const isModalUser = ref(false);
const isModalMesin = ref(false);

const openModalUser = () => {
  isModalUser.value = true;
};

const closeModalUser = () => {
  isModalUser.value = false;
};

const openModalMesin = () => {
  isModalMesin.value = true;
};

const closeModalMesin = () => {
  isModalMesin.value = false;
};

const newUser = ref({
  username: "",
  fullname: "",
  password: "",
  grup: "",
  role: "user",
});

const form = ref({
  caption: "",
});

const profile = ref({
  fullname: "",
  password: "",
});

const resetNewUser = () => {
  newUser.value = {
    username: "",
    fullname: "",
    password: "",
    grup: "",
    role: "user",
  };
};

const filterDaftarMesin = computed(() => {
  let result = [...mesinList.value];

  return result.sort((a, b) => {
    // sisanya urut A-Z
    return a.caption.localeCompare(b.caption, "id");
  });
});

const filterAnggotaGrup = computed(() => {
  let result = [...usersGrup.value];

  if (auth.grup) {
    result = result.filter((item) => item.user.grup === auth.grup);
  }

  return result.sort((a, b) => {
    // user login selalu di atas
    if (a.user.fullname === auth.fullname) return -1;
    if (b.user.fullname === auth.fullname) return 1;

    // sisanya urut A-Z
    return a.user.fullname.localeCompare(b.user.fullname, "id");
  });
});

const loadMemberGrup = async () => {
  try {
    const response = await backendApi.get("/mtc/usr", { timeout: 30000 });
    usersGrup.value = response.data.results || [];
  } catch (err) {
    console.error(err);
  }
};

const loadUsers = async () => {
  try {
    const response = await backendApi.get("/mtc/pwd", { timeout: 30000 });
    users.value = response.data.results || [];
  } catch (err) {
    console.error(err);
  }
};

const loadDaftarMesin = async () => {
  try {
    const response = await backendApi.get("/mtc/mesin", { timeout: 30000 });
    mesinList.value = response.data.results || [];
  } catch (err) {
    console.error(err);
  }
};

const updateProfile = async () => {
  loading.value = true;
  isSaving.value = true;
  const formData = new FormData();
  // Cek fullname
  if (profile.value.fullname.trim() !== "") {
    formData.append("fullname", profile.value.fullname);
  }

  // Cek password
  if (profile.value.password !== "") {
    formData.append("password", profile.value.password);
  }

  try {
    await backendApi.put(`/lakon/${auth.username}`, formData);
    auth.logout();
    router.push("/login");
    alert("Profil berhasil diperbarui, Silahkan Login kembali");
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const addUser = async () => {
  if (
    !newUser.value.username ||
    !newUser.value.fullname ||
    !newUser.value.password ||
    !newUser.value.grup ||
    !newUser.value.role
  ) {
    alert("Isi dulu woi");
    return;
  }
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("username", newUser.value.username);
    formData.append("fullname", newUser.value.fullname);
    formData.append("password", newUser.value.password);
    formData.append("grup", newUser.value.grup);
    formData.append("role", newUser.value.role);

    await backendApi.post("/lakon", formData);

    await loadUsers();
    resetNewUser();
    alert("User berhasil ditambahkan");
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const simpanDaftarMesin = async () => {
  loading.value = true;
  try {
    await backendApi.post("/addMesin", {
      caption: form.value.caption,
    });

    alert("Daftar berhasil ditambahkan");
    closeModalMesin();
    loadDaftarMesin();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (id) => {
  if (!confirm("Yakin ingin menghapus user ini?")) {
    return;
  }

  errorMessage.value = "";

  try {
    await backendApi.delete(`/lakon/${id}`);
    await loadUsers();
  } catch (error) {
    console.error("Gagal menghapus catatan:", error);
    errorMessage.value = "Catatan gagal dihapus. Silakan coba lagi.";
  }
};

const deleteMesin = async (id) => {
  if (!confirm("Yakin ingin menghapus daftar ini?")) {
    return;
  }

  errorMessage.value = "";

  try {
    await backendApi.delete(`/mesin/${id}`);
    await loadDaftarMesin();
  } catch (error) {
    console.error("Gagal menghapus Data:", error);
    errorMessage.value = "Data gagal dihapus. Silakan coba lagi.";
  }
};

const openModalKonfir = () => {
  // Validasi: minimal satu field harus diisi
  if (profile.value.fullname.trim() === "" && profile.value.password === "") {
    alert("Isi fullname atau password terlebih dahulu");
    return;
  }

  if (!confirm("Yakin ingin mengganti?")) {
    return;
  }
  isModalOpenKonfir.value = true;
};
const closeModalKonfir = () => {
  if (isSaving.value) {
    return;
  }

  isModalOpenKonfir.value = false;
};

onMounted(async () => {
  loadMemberGrup();
  loadDaftarMesin();
  if (auth.role === "super-admin") {
    loadUsers();
  }
});
</script>

<template>
  <div class="backdrop-loading" v-if="loading"><LoadingSend /></div>

  <div
    v-if="isModalOpenKonfir"
    class="modal-backdrop-caption"
    @click.self="closeModalKonfir"
  >
    <konfirmasi @submit="updateProfile" />
  </div>

  <div class="profile-page">
    <h1>Profil Pengguna</h1>

    <div class="card">
      <h2>Informasi Akun</h2>

      <div class="account-info">
        <div class="info-item">
          <span class="info-label">Username</span>
          <span class="info-value">: {{ auth.username }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Nama Lengkap</span>
          <span class="info-value">: {{ auth.fullname }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Grup</span>
          <span class="info-value">: {{ auth.grup }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Status Akun</span>
          <span class="info-value">: {{ auth.role }}</span>
        </div>
      </div>

      <div class="form-group">
        <label>Ganti Nama Lengkap</label>
        <input v-model="profile.fullname" />
      </div>

      <div class="password-wrapper">
        <label>Ganti Password Baru</label>
        <input
          class="input password-input"
          :type="showPassword ? 'text' : 'password'"
          v-model="profile.password"
        /><button
          type="button"
          class="eye-btn"
          @click="showPassword = !showPassword"
        >
          <svg
            v-if="!showPassword"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>

          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.86 21.86 0 0 1 5.06-5.94"
            />
            <path
              d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-3.17 4.19"
            />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </button>
      </div>

      <button
        :class="auth.role === 'tester' ? 'btn-disable' : 'btn-primary'"
        @click="openModalKonfir"
        :disabled="auth.role === 'tester'"
      >
        Save
      </button>
    </div>

    <!-- ADMIN ONLY -->
    <div class="action-header">
      <button
        v-if="auth.role === 'admin' || auth.role === 'super-admin'"
        class="btn-primary"
        @click="openModalUser"
      >
        Tambah User
      </button>

      <button
        v-if="auth.role === 'admin' || auth.role === 'super-admin'"
        class="btn-primary"
        @click="openModalMesin"
      >
        Tambah Daftar Mesin
      </button>
    </div>
    <div
      v-if="isModalUser"
      class="modal-backdrop-caption"
      @click.self="closeModalUser"
    >
      <div class="modal-card">
        <h2>Tambah User</h2>

        <div class="form-group">
          <label>Username</label>
          <input class="daftarisi" v-model="newUser.username" />
        </div>

        <div class="form-group">
          <label>Fullname</label>
          <input class="daftarisi" v-model="newUser.fullname" />
        </div>

        <div class="password-wrapper">
          <label>Password</label>
          <input
            class="input password-input"
            :type="showPassword ? 'text' : 'password'"
            v-model="newUser.password"
          />
        </div>

        <div class="form-group">
          <label>Grup</label>
          <input class="daftarisi" v-model="newUser.grup" />
        </div>

        <div class="form-group">
          <label>Role</label>
          <select v-model="newUser.role">
            <option :disabled="auth.role !== 'super-admin'">super-admin</option>
            <option>admin</option>
            <option>user</option>
          </select>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModalUser">Batal</button>

          <button class="btn-primary" @click="addUser">Simpan</button>
        </div>
      </div>
    </div>
  </div>

  <!--Tambah Mesin-->
  <div
    v-if="isModalMesin"
    class="modal-backdrop-caption"
    @click.self="closeModalMesin"
  >
    <div class="modal-card">
      <h2>Tambah Daftar Mesin</h2>

      <form @submit.prevent="simpanDaftarMesin">
        <textarea
          v-model="form.caption"
          placeholder="Satu baris = satu data
Roto
Offset
IPAL"
          rows="8"
          class="input-textarea"
        ></textarea>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeModalMesin">
            Batal
          </button>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? "Menyimpan..." : "Simpan" }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <div class="profile-lists">
    <div
      v-if="auth.role === 'admin' || auth.role === 'super-admin'"
      class="daftar-mesin"
    >
      <div class="card">
        <h2>Mesin yang terdaftar</h2>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in filterDaftarMesin" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.caption }}</td>

              <td>
                <button class="delete-btn" @click="deleteMesin(item.id)">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="daftar-user">
      <div class="card">
        <h2>Anggota Grup</h2>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Grup</th>
              <th>Status Akun</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in filterAnggotaGrup"
              :key="item.id"
              :class="{ 'user-active': item.fullname === auth.fullname }"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ item.fullname }}</td>
              <td>{{ item.grup }}</td>
              <td>{{ item.role }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      class="daftar-user daftar-user-admin"
      v-if="auth.role === 'super-admin'"
    >
      <div class="card">
        <h2>Daftar User</h2>

        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Fullname</th>
              <th>Grup</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in users" :key="item.id">
              <td>{{ item.username }}</td>
              <td>{{ item.fullname }}</td>
              <td>{{ item.grup }}</td>
              <td>{{ item.role }}</td>
              <td>
                <button class="delete-btn" @click="deleteUser(item.id)">
                  Hapus User
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== HALAMAN PROFIL ===== */
.profile-page {
  width: calc(100% - 32px);
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 0;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.profile-page > h1 {
  flex: 1 0 100%;
  margin: 0 0 2px;
  color: var(--text);
  font-size: 23px;
  font-weight: 700;
}

.profile-page > .card {
  flex: 1 1 460px;
}

.profile-page > .action-header {
  width: auto;
  max-width: none;
  flex: 0 1 220px;
  margin: 0;
}

/* ===== CARD ===== */
.card {
  min-width: 0;
  padding: 18px;
  margin: 0;
  background: #ffffff;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.05);
  box-sizing: border-box;
}

.card h2 {
  margin: 0 0 18px;
  padding-bottom: 12px;
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
  border-bottom: 1px solid #edf0f5;
}

/* ===== FORM ===== */
.form-group,
.password-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.form-group label,
.password-wrapper label {
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.form-group input,
.form-group select,
.password-wrapper .input {
  width: 100%;
  min-width: 0;
  height: 36px;
  padding: 8px 10px;
  box-sizing: border-box;
  border: 1px solid #dbe2ea;
  border-radius: 7px;
  background: #f8fafc;
  color: #1e293b;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.password-wrapper .input:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.account-info {
  display: flex;
  font-size: 12px;
  flex-direction: column;
  gap: 0;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
}

.info-label {
  width: 130px;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.info-value {
  color: #222;
  word-break: break-word;
}

/* Username yang tidak bisa diedit */
.form-group input:disabled {
  background: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
}

/* ===== PASSWORD DAN TOMBOL MATA ===== */
.password-wrapper {
  position: relative;
}

.password-wrapper .password-input {
  padding-right: 40px;
}

.eye-btn {
  position: absolute;
  right: 8px;
  bottom: 5px;
  width: 28px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
}

.eye-btn:hover {
  background: #e2e8f0;
  color: #2563eb;
}

.eye-btn svg {
  width: 17px;
  height: 17px;
}

/* ===== TOMBOL ===== */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 35px;
  padding: 8px 14px;
  border: none;
  border-radius: 7px;
  background: #2563eb;
  color: #ffffff;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-disable {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 35px;
  padding: 8px 14px;
  border: none;
  border-radius: 7px;
  background: #5a5c61;
  color: #ffffff;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: not-allowed;
  transition:
    background 0.2s,
    transform 0.2s;
}

/* ===== DAFTAR USER ===== */
.profile-lists {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 12px;
  width: calc(100% - 32px);
  max-width: 1000px;
  margin: 0 auto 24px;
}

.daftar-user,
.daftar-mesin {
  min-width: 0;
  flex: 1 1 300px;
  margin: 0;
  padding: 14px;
  box-sizing: border-box;
  max-height: 360px;
  overflow-y: auto;
  overscroll-behavior: auto;
  scrollbar-width: thin;
  background: #ffffff;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.05);
}

.daftar-user {
  width: auto;
}

.daftar-user .card {
  width: 100%;
  padding: 0;
  border: none;
  box-shadow: none;
}

.daftar-user h2 {
  position: sticky;
  top: 0;
  z-index: 1;
  margin-bottom: 14px;
  padding-top: 4px;
  font-size: 16px;
  background: #ffffff;
}

.user-active {
  color: red;
  font-weight: 500;
}

/* ===== DAFTAR Mesin ===== */
.daftar-mesin {
  width: auto;
}

.daftar-mesin .card {
  width: 100%;
  padding: 0;
  border: none;
  box-shadow: none;
}

.daftar-mesin h2 {
  position: sticky;
  top: 0;
  z-index: 1;
  margin-bottom: 14px;
  padding-top: 4px;
  font-size: 16px;
  background: #ffffff;
}

/* ===== TABEL ===== */
.daftar-user table,
.daftar-mesin table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 11px;
}

.daftar-user th,
.daftar-user td,
.daftar-mesin th,
.daftar-mesin td {
  padding: 8px 6px;
  text-align: left;
  border-bottom: 1px solid #edf0f5;
  overflow-wrap: anywhere;
}

.daftar-user th,
.daftar-mesin th {
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
}

.daftar-user th:first-child,
.daftar-mesin th:first-child {
  border-radius: 6px 0 0 6px;
}

.daftar-user th:last-child,
.daftar-mesin th:last-child {
  border-radius: 0 6px 6px 0;
}

.daftar-user tbody tr:hover,
.daftar-mesin tbody tr:hover {
  background: #f8fafc;
}

.daftar-user tbody tr:last-child td,
.daftar-mesin tbody tr:last-child td {
  border-bottom: none;
}

.daftar-user th:nth-child(1),
.daftar-user td:nth-child(1) {
  width: 3%;
}

.daftar-user th:nth-child(2),
.daftar-user td:nth-child(2) {
  width: 24%;
}

.daftar-user th:nth-child(3),
.daftar-user td:nth-child(3) {
  width: 16%;
}

.daftar-user th:nth-child(4),
.daftar-user td:nth-child(4) {
  width: 14%;
}

.daftar-mesin th:nth-child(1),
.daftar-mesin td:nth-child(1) {
  width: 3%;
}

.daftar-mesin th:nth-child(2),
.daftar-mesin td:nth-child(2) {
  width: 24%;
}

.daftar-mesin th:nth-child(3),
.daftar-mesin td:nth-child(3) {
  width: 16%;
}

.daftar-user-admin th:nth-child(1),
.daftar-user-admin td:nth-child(1) {
  width: 18%;
}

.daftar-user-admin th:nth-child(2),
.daftar-user-admin td:nth-child(2) {
  width: 24%;
}

.daftar-user-admin th:nth-child(3),
.daftar-user-admin td:nth-child(3) {
  width: 16%;
}

.daftar-user-admin th:nth-child(4),
.daftar-user-admin td:nth-child(4) {
  width: 14%;
}

.daftar-user-admin th:nth-child(5),
.daftar-user-admin td:nth-child(5) {
  width: 28%;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .profile-page {
    gap: 14px;
  }

  .profile-page > .action-header {
    flex-basis: 180px;
  }

  .profile-page > h1 {
    font-size: 21px;
  }

  .card {
    padding: 15px;
  }
}

@media (max-width: 560px) {
  .profile-page {
    flex-direction: column;
    gap: 14px;
  }

  .profile-page > .card,
  .profile-page > .action-header {
    width: 100%;
    flex: none;
  }

  .profile-page > h1 {
    width: 100%;
    flex: none;
    font-size: 20px;
    margin-bottom: 0;
  }

  .card {
    padding: 15px;
    border-radius: 10px;
  }

  .card h2 {
    font-size: 15px;
    margin-bottom: 15px;
  }

  .form-group input,
  .form-group select,
  .password-wrapper .input {
    height: 38px;
  }

  .btn-primary {
    min-height: 36px;
  }

  .daftar-user,
  .daftar-mesin {
    padding: 12px;
    border-radius: 10px;
    flex-basis: 100%;
  }

  .daftar-user th,
  .daftar-user td,
  .daftar-mesin th,
  .daftar-mesin td {
    padding: 6px 4px;
  }
}

.modal-backdrop-caption {
  position: fixed;
  inset: 0;
  background: rgb(22 34 52 / 52%);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
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

.delete-btn {
  background: #dc2626;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 4px 6px;
  border: 1px solid #e8edf4;
  border-radius: 6px;
  font: inherit;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
  transition:
    background 150ms ease,
    border-color 150ms ease;
}

.delete-btn:hover {
  background: #b91c1c;
}

.optional-label {
  color: #97a1af;
  font-weight: 400;
}

/**CSS Tambah mesin */
.action-header {
  width: calc(100% - 32px);
  max-width: 1000px;
  margin: 0 auto 18px;
  box-sizing: border-box;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.modal-card {
  width: min(92vw, 600px);
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.15);
}

.modal-card h2 {
  margin: 0 0 18px;
  font-size: 18px;
  font-weight: 700;
  color: black;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.btn-secondary {
  padding: 8px 14px;
  border: 1px solid #dbe2ea;
  border-radius: 7px;
  background: #fff;
  color: #334155;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.input-textarea {
  width: 100%;
  min-height: 220px;
  padding: 12px;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  resize: vertical;
  box-sizing: border-box;
}
</style>
