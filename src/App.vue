<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { RouterView } from "vue-router";
import { useAuthStore } from "./stores/auth.js";
import Footer from "./components/Footer.vue";
import TopBar from "./components/TopBar.vue";
import SlideBar from "./components/SlideBar.vue";
import akhirSesi from "./components/SessionEnd.vue";

const auth = useAuthStore();
const sesiModal = ref(false);
const SESSION_TIME = 43200000;

const tutupModals = () => {
  sesiModal.value = false;
  window.location.href = "/";
};

const resetSession = () => {
  localStorage.setItem("expiredTime", String(Date.now() + SESSION_TIME));
};

const checkSession = () => {
  const expiredTime = Number(localStorage.getItem("expiredTime"));

  if (!expiredTime || Date.now() > expiredTime) {
    localStorage.removeItem("username");
    localStorage.removeItem("expiredTime");

    sesiModal.value = true;

    auth.logout();
  }
};

const activityEvents = [
  "click",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "input",
];

onMounted(() => {
  if (!auth.username) return;

  resetSession();
  // cek session setiap detik
  const interval = setInterval(checkSession, 60000);

  // reset session saat ada aktivitas
  activityEvents.forEach((event) => {
    window.addEventListener(event, resetSession);
  });

  // simpan untuk cleanup
  window._sessionInterval = interval;
});

onUnmounted(() => {
  activityEvents.forEach((event) => {
    window.removeEventListener(event, resetSession);
  });

  clearInterval(window._sessionInterval);
});
</script>

<template>
  <div class="layout">
    <TopBar />

    <SlideBar v-if="auth.fullname" />

    <main :class="auth.fullname ? 'content-sidebar' : 'content-full'">
      <RouterView />
    </main>
    <footer :class="auth.fullname ? 'footer-sidebar' : 'footer-full'">
      <Footer />
    </footer>
    <akhirSesi v-if="sesiModal" @oke="tutupModals" />
  </div>
</template>

<style>
.content-sidebar {
  margin-left: 180px;
  flex: 1;
  transition: margin-left 0.3s ease;
}

.content-full {
  margin-left: 0;
  flex: 1;
  transition: margin-left 0.3s ease;
}

.footer-sidebar {
  margin-left: 180px;
  transition: margin-left 0.3s ease;
}

.footer-full {
  margin-left: 0;
  transition: margin-left 0.3s ease;
}
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .content-sidebar {
    margin-left: 0;
  }
  .footer-sidebar {
    margin-left: 0;
  }
}
</style>
