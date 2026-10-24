<script setup>
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { useAuthStore } from "./stores/auth.js";
import Footer from "./components/Footer.vue";
import TopBar from "./components/TopBar.vue";
import SlideBar from "./components/SlideBar.vue";

const auth = useAuthStore();
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
