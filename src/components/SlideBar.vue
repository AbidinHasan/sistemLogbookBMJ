<script setup>
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

const LogOut = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("fullname");
  localStorage.removeItem("grup");
  localStorage.removeItem("expiredTime");
  window.location.href = "/login";
};
</script>

<template>
  <aside class="sidebar">
    <router-link to="/" class="menu">Dashboard</router-link>
    <router-link to="/aktifitas" class="menu">Manajemen Aktifitas</router-link>

    <router-link to="/profil" class="menu">Akun</router-link>

    <div class="user-info">
      <div class="logout-btn">
        <button @click="LogOut">Logout</button>
      </div>
      <p>{{ auth.fullname }}</p>
      <p>{{ auth.grup }}</p>
      <p v-if="auth.role === 'admin' || auth.role === 'super-admin'">
        {{ auth.role }}
      </p>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 49px; /* sesuaikan tinggi TopBar */
  left: 0;
  width: 190px;
  height: calc(100vh - 60px);
  background: #232733;
  border-right: 1px solid #333;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(97, 99, 109) rgba(45, 47, 59, 0.801);
}

.menu {
  color: white;
  text-decoration: none;
  font-family: var(--sans);
  font-weight: 500;
  padding: 12px 20px;
  transition: 0.2s;
}

.menu:hover,
.router-link-active {
  background: #2f3545;
}

.user-info {
  margin-top: auto;
  padding: 13px;
}

.user-info p {
  margin: 0;
  color: white;
  font-family: var(--sans);
}

.user-info p:nth-child(3) {
  color: #aaa;
  font-size: 13px;
}
.user-info p:last-child {
  color: #aaa;
  font-size: 13px;
}

.logout-btn {
  margin-top: 80px;
  padding: 5px;
}

.logout-btn button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #dc2626;
  color: white;
  font-family: var(--sans);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn button:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

.logout-btn button:active {
  transform: translateY(0);
}

.logout-btn button::before {
  content: "↩ ";
}
/* HP & Tablet */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
