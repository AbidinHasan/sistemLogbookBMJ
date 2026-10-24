<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth.js";
import MenuBar from "./MenuBar.vue";

const auth = useAuthStore();

const kembali = () => {
  window.location.href = "/";
};

const LogOut = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("expiredTime");
  window.location.href = "/";
};
</script>

<template>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" @click="kembali" aria-label="Utility Vibes">
        <span>Logbook MTC</span>
      </a>
      <div class="action-btn">
        <MenuBar v-if="auth.username" />
      </div>
    </div>
  </header>
</template>

<style scoped>
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
  min-height: 50px;
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
  color: var(--text-h);
  font-size: 18px;
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

.action-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-btn {
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  background: rgb(0, 110, 255);
  color: white;
  font: inherit;

  cursor: pointer;
  transition:
    background 160ms ease,
    transform 160ms ease;
}

.logout-btn {
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  background: red;
  color: white;
  font: inherit;

  cursor: pointer;
  transition:
    background 160ms ease,
    transform 160ms ease;
}

.login-btn span {
  font-size: 20px;
  line-height: 15px;
  margin-left: auto;
  display: flex;
}

.login-btn,
.logout-btn {
  padding: 5px 8px;
  font-weight: 500;
}

.login-btn:hover {
  transform: translateY(-1px);
  background: #4a80c2;
}

.logout-btn span {
  font-size: 20px;
  line-height: 15px;
}

.logout-btn:hover {
  transform: translateY(-1px);
  background: #c24a4a;
}

@media (max-width: 768px) {
  .topbar-inner {
    width: calc(100% - 20px);
    min-height: 50px;
  }

  .brand {
    font-size: 16px;
  }

  .login-btn,
  .logout-btn {
    font-size: 13px;
    padding: 4px 8px;
  }

  .action-btn {
    gap: 8px;
  }
}
</style>
