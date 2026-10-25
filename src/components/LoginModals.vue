<style scoped>
/* LAYOUT LOGIN */
.login-layout {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 65px;
  padding: 40px;
  box-sizing: border-box;
}

/* PANEL ILUSTRASI */
.login-decoration {
  width: 390px;
  max-width: 100%;
  color: #444444;
}

.decoration-content {
  position: relative;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* KARTU CATATAN */
.note-card {
  position: relative;
  width: 260px;
  padding: 22px;
  box-sizing: border-box;
  background: #dadada;
  border: 1px solid #e5dcc7;
  border-radius: 8px;
  box-shadow: 5px 7px 0 #919191;
  transform: rotate(-4deg);
  z-index: 2;
}

.note-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 13px;
  border-bottom: 2px solid #e8e2d4;
}

.note-title h3,
.inventory-card h3 {
  margin: 0;
  font-size: 19px;
}

.note-title span {
  font-size: 25px;
}

.note-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px dashed #ded8ca;
  font-size: 13px;
  color: #536579;
}

.check {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 1.5px solid #6c9b87;
  border-radius: 5px;
  color: #4b9074;
  font-weight: bold;
}

.pencil {
  position: absolute;
  right: -18px;
  bottom: -20px;
  font-size: 44px;
  transform: rotate(-35deg);
}

/* KARTU INVENTORI */
.inventory-card {
  position: relative;
  width: 235px;
  align-self: flex-end;
  margin-top: -65px;
  padding: 20px;
  box-sizing: border-box;
  background: #ababab;
  border: 1px solid #d8e1eb;
  border-radius: 15px;
  box-shadow: 8px 10px 0 #747474;
  transform: rotate(4deg);
  z-index: 3;
}

.inventory-icon {
  margin-bottom: 8px;
  font-size: 32px;
}

.inventory-card h3 {
  margin-bottom: 12px;
  font-size: 16px;
  color: #474c52;
}

.inventory-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-top: 1px solid #e9eef4;
  color: #525962;
  font-size: 12px;
}

.inventory-check {
  color: #43856b;
  font-weight: bold;
  font-size: 16px;
}

.decoration-footer {
  margin-top: 35px;
  color: #718096;
  font-size: 13px;
  line-height: 1.7;
}

/* FORM LOGIN */
.form {
  position: relative;
  display: flex;
  width: 300px;
  flex-shrink: 0;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  margin-top: -10rem;
  padding: 2.5em;
  box-sizing: content-box;
  background: #dbdce6;
  border: 1px solid #b4b6b9;
  border-radius: 20px;
  box-shadow: 10px 10px 0 #aeaeca;
  transition: 0.3s ease;
}

.form:hover {
  box-shadow: 13px 13px 0 #4a79b4;
  transform: translate(-2px, -2px);
}

.heading {
  color: #183653;
  padding-bottom: 1.5em;
  text-align: center;
  font-weight: 800;
  font-size: 25px;
}

.input {
  width: 100%;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1px solid #b9c8d9;
  background: #f0f4f9;
  outline: none;
  padding: 0.85em;
  color: #183653;
  transition: 0.25s ease;
}

.input:hover,
.input:focus {
  background: #fff;
  border-color: #537ba5;
  box-shadow: 0 0 0 3px #dbeafe;
}

.form .btn {
  margin-top: 1.5em;
  align-self: stretch;
  padding: 0.85em;
  border-radius: 8px;
  border: none;
  background: #244d73;
  color: white;
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s ease;
}

.form .btn:hover {
  background: #183653;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px #244d7333;
}

.form .btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.password-wrapper {
  position: relative;
  width: 100%;
}

.password-input {
  padding-right: 40px;
}

.eye-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  color: #536579;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye-btn:hover {
  color: #183653;
}

.form-alert {
  padding: 11px 13px;
  border: 1px solid #f3c9ce;
  border-radius: 9px;
  background: #fff5f6;
  color: #b6404d;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
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

/* TABLET */
@media (max-width: 900px) {
  .login-layout {
    gap: 30px;
    padding: 25px;
  }

  .login-decoration {
    width: 300px;
  }

  .note-card {
    width: 230px;
  }

  .inventory-card {
    width: 210px;
  }

  .form {
    width: 260px;
    padding: 2em;
  }
}

/* HP */
@media (max-width: 650px) {
  .login-layout {
    min-height: 100vh;
    padding: 25px 15px;
  }

  .login-decoration {
    display: none;
  }

  .form {
    width: min(300px, calc(100vw - 100px));
    padding: 2em;
  }

  .heading {
    font-size: 23px;
  }
}
</style>

<template>
  <div class="modal-backdrop-caption" v-if="loading">
    <loadingSend />
  </div>

  <div class="login-layout">
    <!-- FORM LOGIN -->
    <form class="form" @submit.prevent="login">
      <p class="heading">Logbook Login</p>

      <input
        class="input"
        placeholder="Username"
        v-model="username"
        type="text"
        required
        autocomplete="username"
        @keypress="enter"
      />

      <div class="password-wrapper">
        <input
          class="input password-input"
          placeholder="Password"
          required
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          @keypress="enter"
        />

        <button
          type="button"
          class="eye-btn"
          @click="showPassword = !showPassword"
          :aria-label="
            showPassword ? 'Sembunyikan password' : 'Tampilkan password'
          "
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

      <button class="btn" type="submit">Submit</button>

      <p v-if="errorMessage" class="form-alert" role="alert">
        {{ errorMessage }}
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { backendApi } from "../services/api";
import { useAuthStore } from "../stores/auth.js";
import loadingSend from "./LoadingContent.vue";

const router = useRouter();
const auth = useAuthStore();
const errorMessage = ref("");
const username = ref("");
const password = ref("");
const loading = ref(false);
const showPassword = ref(false);

const login = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await backendApi.post("/login", {
      username: username.value.trim(),
      password: password.value,
    });

    if (response.data.success) {
      const user = response.data.user;

      auth.login({
        username: user.username,
        fullname: user.fullname,
        grup: user.grup,
        role: user.role,
        id: user.id,
      });

      window.location.href = "/";
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Username atau password salah";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  auth.logout();
});
</script>
