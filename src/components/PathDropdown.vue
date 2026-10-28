<template>
  <!-- From Uiverse.io by Na3ar-17 -->
  <div class="card">
    <ul class="list">
      <li class="element">
        <router-link class="label item-link" to="/">Beranda</router-link>
      </li>
      <li class="element">
        <router-link class="label item-link" to="/aktifitas"
          >Manajemen Aktfitas</router-link
        >
      </li>

      <li class="element">
        <router-link class="label item-link" to="/profil">Akun</router-link>
      </li>
      <li class="delete" v-if="auth.username">
        <a class="label item-link" @click="LogOut">Logout</a>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const menuOpen = ref(false);
const navbarRef = ref(null);
const checkboxRef = ref(null);

const LogOut = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("fullname");
  localStorage.removeItem("grup");
  localStorage.removeItem("expiredTime");
  window.location.href = "/login";
};

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function closeMenu() {
  menuOpen.value = false;
  if (checkboxRef.value) {
    checkboxRef.value.checked = false;
  }
}

function handleDocumentClick(event) {
  if (!navbarRef.value) return;
  if (!navbarRef.value.contains(event.target)) {
    closeMenu();
  }
}

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
});
</script>

<style scoped>
.card {
  display: flex;
  background: rgb(59, 59, 97);
  box-shadow: 0 8px 32px 0 #0d2626;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  border-radius: 20Q;
  border: 1px solid rgba(255, 255, 255, 0.18);
  justify-content: space-between;
  padding: 10px;
  position: absolute;
  top: 50px;
  right: 15px;
  z-index: 99;
}

.card .separator {
  border-top: 1.5px solid #42434a;
}

.card .list {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  padding: 0px 1px;
  height: auto;
  width: 170px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d3c7db rgba(36, 40, 50, 1);
  z-index: 30;
}

.card .list .element {
  display: flex;
  align-items: stretch;
  color: #ffffff;
  gap: 10px;
  transition: all 0.3s ease-out;
  padding: 0;
  border-radius: 6px;
  cursor: pointer;
}
.card .list .delete {
  display: flex;
  align-items: stretch;
  color: #ffffff;
  gap: 10px;
  transition: all 0.3s ease-out;
  padding: 0;
  border-radius: 6px;
  cursor: pointer;
}

.card .list .element .item-link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 9px 10px;
  color: inherit;
  text-decoration: none;
}
.card .list .delete .item-link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 9px 10px;
  color: inherit;
  text-decoration: none;
}

.card .list .element svg {
  width: 19px;
  height: 19px;
  transition: all 0.3s ease-out;
}

.card .list .element .label {
  font-weight: 660;
  color: #ffffff;
}

.card .list .delete .label {
  font-weight: 760;
  color: #d92121;
}

.card .list .element:hover {
  background-color: #9d9db9;
  color: #ffffff;
  transform: translate(1px, -1px);
}
.card .list .delete:hover {
  background-color: #652828a0;
  transform: translate(1px, -1px);
}

.card .list .element:active {
  transform: scale(0.99);
}
.card .list .delete:active {
  transform: scale(0.99);
}

.card .list:not(:last-child) .element:hover svg {
  stroke: #ffffff;
}

.card .list:last-child svg {
  stroke: #bd89ff;
}
.card .list:last-child .element {
  color: #bd89ff;
}

.card .list:last-child .element:hover {
  background-color: rgba(0, 0, 0, 0.836);
}
</style>
