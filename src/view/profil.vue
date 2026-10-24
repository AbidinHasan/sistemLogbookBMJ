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
const usersGrup = ref([]);
const showPassword = ref(false);
const isSaving = ref(false);
const isModalOpenKonfir = ref(false);
const loading = ref(false);
const errorMessage = ref("");

const newUser = ref({
  username: "",
  fullname: "",
  password: "",
  grup: "",
  role: "user",
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
    const response = await backendApi.get("/sia1/usr", { timeout: 30000 });
    usersGrup.value = response.data.results || [];
  } catch (err) {
    console.error(err);
  }
};

const loadUsers = async () => {
  try {
    const response = await backendApi.get("/sia1/pwd", { timeout: 30000 });
    users.value = response.data.results || [];
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
  if (auth.role === "admin" || auth.role === "super-admin") {
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
    <div
      v-if="auth.role === 'admin' || auth.role === 'super-admin'"
      class="card"
    >
      <h2>Tambah User</h2>

      <div class="form-group">
        <label>Username</label>
        <input class="daftarisi" v-model="newUser.username" required />
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

      <button class="btn-primary" @click="addUser">Tambah User</button>
    </div>
  </div>

  <div class="daftar-user">
    <div class="card">
      <h2>Anggota Grup</h2>

      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Grup</th>
            <th>Status Akun</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in filterAnggotaGrup"
            :key="item.id"
            :class="{ 'user-active': item.fullname === auth.fullname }"
          >
            <td>{{ item.fullname }}</td>
            <td>{{ item.grup }}</td>
            <td>{{ item.role }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="daftar-user" v-if="auth.role === 'super-admin'">
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
</template>

<style scoped>
/* ===== HALAMAN PROFIL ===== */
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 18px;
}

.profile-page > h1 {
  grid-column: 1 / -1;
  margin: 0 0 2px;
  color: var(--text);
  font-size: 23px;
  font-weight: 700;
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
.daftar-user {
  width: min(100% - 40px, 1000px);
  margin: 0 auto 24px;
  padding: 18px;
  box-sizing: border-box;
  overflow-x: auto;
  background: #ffffff;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.05);
}

.daftar-user .card {
  width: 100%;
  padding: 0;
  border: none;
  box-shadow: none;
}

.daftar-user h2 {
  margin-bottom: 14px;
  font-size: 16px;
}

.user-active {
  color: red;
  font-weight: 500;
}

/* ===== TABEL ===== */
.daftar-user table {
  width: 100%;
  min-width: 420px;
  border-collapse: collapse;
  font-size: 12px;
}

.daftar-user th,
.daftar-user td {
  padding: 11px 12px;
  text-align: left;
  border-bottom: 1px solid #edf0f5;
  white-space: nowrap;
}

.daftar-user th {
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
}

.daftar-user th:first-child {
  border-radius: 6px 0 0 6px;
}

.daftar-user th:last-child {
  border-radius: 0 6px 6px 0;
}

.daftar-user tbody tr:hover {
  background: #f8fafc;
}

.daftar-user tbody tr:last-child td {
  border-bottom: none;
}

/* ===== RESPONSIVE TABLET ===== */
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
    gap: 14px;
  }

  .profile-page > h1 {
    font-size: 21px;
  }

  .card {
    padding: 15px;
  }

  .daftar-user {
    width: calc(100% - 32px);
    padding: 14px;
  }
}

/* ===== RESPONSIVE HP ===== */
@media (max-width: 560px) {
  .profile-page {
    grid-template-columns: minmax(0, 1fr);
    padding: 14px;
    gap: 14px;
  }

  .profile-page > h1 {
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

  .daftar-user {
    width: calc(100% - 28px);
    padding: 12px;
    border-radius: 10px;
  }

  .daftar-user th,
  .daftar-user td {
    padding: 10px;
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

.delete-btn {
  background: #dc2626;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  flex: 1;
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

.optional-label {
  color: #97a1af;
  font-weight: 400;
}
</style>
